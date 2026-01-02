import { BlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  InstructionBase,
  JumpInstruction,
} from "../instructions";
import { SelectInstruction } from "../instructions/SelectInstruction";
import { SourceRange } from "../SourceRange";
import { EMutability, IBindableValue, IInstruction } from "../types";
import { counterName } from "../utils";
import { LiteralValue, StoreValue } from "../values";
import { Block, BlockEdge, EdgeArgument } from "./block";
import { GlobalId, ImmutableId } from "./id";
import {
  BinaryOperationInstruction,
  BinarySelectInstruction,
  BreakInstruction,
  EndIfInstruction,
  EndInstruction,
  LoadInstruction,
  StoreInstruction,
  TBlockEndInstruction,
  TBlockInstruction,
  getEffectiveBlockSize,
  isBinaryOperationInlined,
  isLowerable,
} from "./instructions";
import { ReaderMap, WriterMap } from "./optimizer";
import { SSABuilder } from "./ssa";
import { generateGraphVizDOTString } from "./visualize";

//  TODO: handle multiple leaf blocks (necessary because end and stop exist)
// control flow graph internals for the compiler
export class Graph {
  start = new Block();
  /**
   * Marks wether or not the parents of blocks are invalid and need to be
   * recomputed.
   *
   * Each optimization function that modifies the structure of the graph needs
   * to either update the parents by itself or set this to true to let the next
   * optimizations recompute the parents if necessary.
   *
   * Optimizations that make use of the parents must call setParents() before
   * using them.
   */
  invalidParents = true;

  static from(entry: Block, loc: SourceRange) {
    const graph = new Graph();
    graph.start = entry;

    traverse(graph.start, block => {
      block.endInstruction ??= new EndInstruction(loc);
    });

    graph.setParents();

    return graph;
  }

  setParents() {
    if (!this.invalidParents) return;
    this.invalidParents = false;

    const blocks = getReversePostOrder(this.start);
    for (const block of blocks) {
      block.parents = [];
    }

    for (const block of blocks) {
      for (const child of block.children) {
        child.addParent(block);
      }
    }
  }

  removeCriticalEdges() {
    this.setParents();
    const queue: Block[] = [this.start];
    const visited = new Set<Block>();

    while (queue.length > 0) {
      const block = queue.shift()!;

      if (visited.has(block)) {
        continue;
      }
      visited.add(block);
      const children = block.children;

      queue.push(...children);

      if (block.endInstruction?.type !== "break-if") {
        continue;
      }

      let { consequent, alternate, source } = block.endInstruction;

      if (consequent.block.parents.length > 1) {
        const newBlock = new Block(new BreakInstruction(consequent, source));
        newBlock.addToParents();

        consequent = newBlock.toForward();
      }

      if (alternate.block.parents.length > 1) {
        const newBlock = new Block(new BreakInstruction(alternate, source));
        newBlock.addToParents();

        alternate = newBlock.toForward();
      }

      block.removeFromParents();
      block.endInstruction.consequent = consequent;
      block.endInstruction.alternate = alternate;
      block.addToParents();
    }
  }

  mergeBlocks() {
    this.setParents();

    traverse(this.start, block => {
      while (block.endInstruction?.type === "break") {
        const { target } = block.endInstruction;
        if (target.block.parents.length !== 1) break;

        for (const inst of target.block.instructions) {
          block.instructions.pushBack(inst);
        }

        target.block.removeFromParents();
        block.removeFromParents();
        block.endInstruction = target.block.endInstruction;
        block.addToParents();
      }
    });
  }

  /**
   * Does not take block parameters into account. Only call before SSA
   * construction or after SSA deconstruction.
   */
  skipBlocks() {
    // jump threading can leave
    // some "hanging" parents (blocks that have no parents themselves,
    // but are still marked as parents of reachable blocks),
    // which are not easy to remove, so instead we invalidate the parents
    this.invalidParents = true;

    function tryToRedirect(oldTarget: BlockEdge) {
      let current = oldTarget;
      const mappedArgs = new Map<number, EdgeArgument>();

      while (
        current.block.endInstruction?.type === "break" &&
        current.block.instructions.isEmpty
      ) {
        const { endInstruction } = current.block;
        current = endInstruction.target;

        for (let i = 0; i < endInstruction.target.args.length; i++) {
          const arg = endInstruction.target.args[i];
          const param = endInstruction.target.block.parameters[i];
          mappedArgs.set(
            param.value.number,
            mappedArgs.get(arg.value.number) ?? arg,
          );
        }
      }

      if (current === oldTarget) return;
      const newTarget = new BlockEdge(
        current.type,
        current.block,
        current.args.map(arg => mappedArgs.get(arg.value.number) ?? arg),
      );

      return newTarget;
    }

    traverse(this.start, block => {
      switch (block.endInstruction?.type) {
        case "break": {
          const newTarget = tryToRedirect(block.endInstruction.target);
          if (!newTarget) break;
          block.endInstruction.target = newTarget;
          break;
        }
        case "end-if": {
          const { alternate } = block.endInstruction;
          const newAlternate = tryToRedirect(alternate);
          if (!newAlternate) break;
          block.endInstruction.alternate = newAlternate;
          break;
        }
        case "break-if": {
          const { consequent, alternate } = block.endInstruction;
          const newConsequent = tryToRedirect(consequent);
          const newAlternate = tryToRedirect(alternate);

          if (newConsequent) block.endInstruction.consequent = newConsequent;
          if (newAlternate) block.endInstruction.alternate = newAlternate;
          break;
        }
      }
    });
  }

  /**
   * Transforms blocks whose only purpose is to jump into an empty leaf node
   * (that ends with end or stop) into leaf nodes themselves. This enables the
   * creation of end-if instructions.
   */
  splitLeaves() {
    traverse(this.start, block => {
      if (block.endInstruction?.type !== "break") return;
      const target = block.endInstruction.target.block;
      if (!target.instructions.isEmpty) return;
      switch (target.endInstruction?.type) {
        case "end":
        case "stop":
          block.removeFromParents();
          block.endInstruction = target.endInstruction;
          break;
      }
    });
  }

  lower(c: ICompilerContext) {
    const cursor = new BlockCursor("edit", this.start);

    traverse(this.start, block => {
      cursor.currentBlock = block;

      for (const node of block.instructions.nodes()) {
        const inst = node.instruction;
        if (!isLowerable(inst)) continue;

        cursor.position = node;
        inst.lower(c, cursor);
        cursor.position = node;
        cursor.removeInstruction();
      }
    });
  }

  toMlog(c: ICompilerContext) {
    this.lower(c);
    this.optimize(c);
    const instructions: IInstruction[] = [];
    const addresses = new Map<Block, IBindableValue<number | null>>();
    const orderedBlocks = getReversePostOrder(this.start);
    const counterVar = new StoreValue(counterName, EMutability.mutable);
    const reads = getReaderMap(c, this.start);
    const writes = getWriterMap(c, this.start);

    for (const block of orderedBlocks) {
      addresses.set(block, new LiteralValue(null));
    }

    for (let i = 0; i < orderedBlocks.length; i++) {
      const block = orderedBlocks[i];
      instructions.push(new AddressResolver(addresses.get(block)!));
      // instructions.push(new InstructionBase("blockstart"));
      instructions.push(...block.toMlog(c, reads, writes));
      const { endInstruction } = block;
      switch (endInstruction?.type) {
        case "break":
          instructions.push(
            new JumpInstruction(
              addresses.get(endInstruction.target.block)!,
              EJumpKind.Always,
            ),
          );
          instructions[instructions.length - 1].source = endInstruction.source;
          break;
        case "break-if": {
          const condition = c.getValue(endInstruction.condition);
          const conditionInst = block.conditionInstruction(writes);
          const { consequent, alternate, source } = endInstruction;
          const useSelect = alternate.block !== orderedBlocks[i + 1];

          if (useSelect) {
            if (conditionInst) {
              instructions.push(
                new SelectInstruction(
                  counterVar,
                  conditionInst.operator as EJumpKind,
                  c.getValueOrTemp(conditionInst.left),
                  c.getValueOrTemp(conditionInst.right),
                  addresses.get(consequent.block)!,
                  addresses.get(alternate.block)!,
                ),
              );
            } else {
              instructions.push(
                new SelectInstruction(
                  counterVar,
                  EJumpKind.NotEqual,
                  condition,
                  new LiteralValue(0),
                  addresses.get(consequent.block)!,
                  addresses.get(alternate.block)!,
                ),
              );
            }

            instructions[instructions.length - 1].source = source;
          } else {
            if (conditionInst) {
              instructions.push(
                new JumpInstruction(
                  addresses.get(consequent.block)!,
                  conditionInst.operator as EJumpKind,
                  c.getValue(conditionInst.left),
                  c.getValue(conditionInst.right),
                ),
              );
            } else {
              instructions.push(
                new JumpInstruction(
                  addresses.get(consequent.block)!,
                  EJumpKind.NotEqual,
                  condition,
                  new LiteralValue(0),
                ),
              );
            }

            instructions.push(
              new JumpInstruction(
                addresses.get(alternate.block)!,
                EJumpKind.Always,
              ),
            );
            instructions[instructions.length - 1].source = source;
            instructions[instructions.length - 2].source = source;
          }
          break;
        }
        case "end-if": {
          const condition = c.getValue(endInstruction.condition);
          const conditionInst = block.conditionInstruction(writes);
          const { source } = endInstruction;
          if (conditionInst) {
            instructions.push(
              new JumpInstruction(
                new LiteralValue(0),
                conditionInst.operator as EJumpKind,
                c.getValue(conditionInst.left),
                c.getValue(conditionInst.right),
              ),
            );
          } else {
            instructions.push(
              new JumpInstruction(
                new LiteralValue(0),
                EJumpKind.NotEqual,
                condition,
                new LiteralValue(0),
              ),
            );
          }

          instructions[instructions.length - 1].source = source;
          break;
        }
        case "end":
        case "stop":
          instructions.push(new InstructionBase(endInstruction.type));
          instructions[instructions.length - 1].source = endInstruction?.source;
          break;
        default:
          throw new CompilerError("Not implemented");
      }
    }

    return instructions;
  }

  /**
   * Attempts to put empty instruction blocks on the consequent side of break-if
   * instructions in order to reduce the amount of jumps present in the
   * generated code. This is done because an empty block usually contains a jump
   * or an end instruction, and in the first case that jump being on the
   * alternate side of the break-if neutralizes the benefit of placing basic
   * blocks in reverse post-order.
   */
  canonicalizeBreakIfs(c: ICompilerContext) {
    const readers = getReaderMap(c, this.start);
    const writers = getWriterMap(c, this.start);

    traverseReversePostOrder(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;

      // checking like this is required because there are no critical
      // edges at this point in the optimization pipeline
      const isBackBreak = (end: TBlockEndInstruction | undefined) =>
        end?.type === "break" && end?.target.type === "backward";

      if (getEffectiveBlockSize(alternate.block, readers) > 0) return;

      // canonicalization doesn't really outside these cases
      // so it just makes the generated code harder to read
      switch (alternate.block.endInstruction?.type) {
        case "break":
        case "break-if":
        case "end":
          break;
        default:
          return;
      }

      // keep back edges on the consequent block
      // because they usually generate less instructions
      // than if they were on the alternate side
      if (
        consequent.block.instructions.isEmpty &&
        isBackBreak(consequent.block.endInstruction)
      )
        return;

      const writer = writers.get(endInstruction.condition);

      if (writer?.type === "binary-operation") {
        const conditionReaders = readers.get(endInstruction.condition);

        if (
          conditionReaders.size === 1 &&
          conditionReaders.has(endInstruction)
        ) {
          if (!writer.isInvertible()) return;
          writer.invert();
          endInstruction.swapEdges();
          return;
        }
      }

      const newCondition = c.createImmutableId();
      block.instructions.pushBack(
        new BinaryOperationInstruction(
          "equal",
          endInstruction.condition,
          c.registerValue(new LiteralValue(0)),
          newCondition,
          endInstruction.source,
        ),
      );
      endInstruction.condition = newCondition;
      endInstruction.swapEdges();
    });
  }

  /**
   * Flip break-if instructions whose condition is a value being falsy.
   *
   * This reduces the amount of instructions used to represent the same logic
   *
   * Must be called after the break-ifs have been canonicalized and after
   * operation instructions have been optimized and merged
   */
  flipBreakIfs(c: ICompilerContext) {
    const writes = getWriterMap(c, this.start);

    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;

      const conditionInst = block.conditionInstruction(writes);

      if (
        conditionInst?.operator !== "equal" ||
        // don't un-canonicalize break-ifs
        consequent.block.instructions.length === 0
      )
        return;
      const right = c.getValue(conditionInst.right);
      if (!(right instanceof LiteralValue) || right.data !== 0) return;
      endInstruction.condition = conditionInst.left;
      endInstruction.swapEdges();
    });
  }

  /**
   * Transforms break-if instructions into end-if instructions when the
   * consequent block consists of a single end instruction. Since end
   * instructions are essentially jumps to the beginning of the script, this
   * optimization removes an unnecessary jump, which may also improve the
   * instruction layout of the resulting code.
   */
  createEndIfs(c: ICompilerContext) {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { condition, alternate, consequent } = endInstruction;

      let preservedEdge: BlockEdge;

      if (
        consequent.block.instructions.isEmpty &&
        consequent.block.endInstruction?.type === "end"
      ) {
        preservedEdge = alternate;
      } else if (
        alternate.block.instructions.isEmpty &&
        alternate.block.endInstruction?.type === "end"
      ) {
        preservedEdge = consequent;
      } else {
        return;
      }

      // creates "hanging" parents
      this.invalidParents = true;

      block.endInstruction = new EndIfInstruction(
        condition,
        preservedEdge,
        endInstruction.source,
      );
    });
  }

  /**
   * Puts constants at the right side of binary operations whenever possible
   *
   * This reduces the amount of edge cases that need to be handled by other
   * optimization functions
   */
  canonicalizeBinaryOperations(c: ICompilerContext) {
    traverse(this.start, block => {
      for (const inst of block.instructions) {
        if (inst.type !== "binary-operation") continue;
        if (!inst.isCanonicalizable()) continue;
        const left = c.getValue(inst.left);
        if (!(left instanceof LiteralValue)) continue;

        inst.canonicalize();
      }
    });
  }

  hoistLoadLiterals(c: ICompilerContext) {
    const entry = this.start;

    traverse(this.start, block => {
      if (block === entry) return;
      for (const node of block.instructions.nodes()) {
        const inst = node.instruction;
        if (inst.type !== "load-literal") continue;
        block.instructions.remove(node);
        entry.instructions.pushFront(inst);
      }
    });
  }

  foldConstantOperations(c: ICompilerContext) {
    const cursor = new BlockCursor("edit", this.start);
    traverse(this.start, block => {
      let current = block.instructions.head;
      cursor.currentBlock = block;

      while (current) {
        const inst = current.instruction;
        if (
          inst.type !== "binary-operation" &&
          inst.type !== "unary-operation" &&
          inst.type !== "binary-select"
        ) {
          current = current.next;
          continue;
        }
        cursor.position = current;
        inst.constantFold(c, cursor);
        current = cursor.position.next;
      }
    });
  }

  removeConstantBreakIfs(c: ICompilerContext) {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const condition = c.getValue(endInstruction.condition);
      if (!(condition instanceof LiteralValue)) return;

      const newBreak = new BreakInstruction(
        condition.num === 0
          ? endInstruction.alternate
          : endInstruction.consequent,
        endInstruction.source,
      );
      block.endInstruction = newBreak;

      // removing constant break-ifs can leave
      // some "hanging" parents (blocks that have no parents themselves,
      // but are still marked as parents of reachable blocks),
      // which are not easy to remove, so instead we invalidate the parents
      this.invalidParents = true;
    });
  }

  removeConstantEndIfs(c: ICompilerContext) {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "end-if") return;
      const condition = c.getValue(endInstruction.condition);
      if (!(condition instanceof LiteralValue)) return;

      const { source } = endInstruction;
      if (condition.num) {
        block.endInstruction = new EndInstruction(source);

        // leaves the alternate block as a "hanging" parent
        this.invalidParents = true;
      } else {
        block.endInstruction = new BreakInstruction(
          endInstruction.alternate,
          source,
        );
      }
    });
  }

  /**
   * For an unoptimized ternary operation, the maximum amount of instructions
   * executed is three.
   *
   * So we can only allow at most two instructions to be executed before the
   * select, otherwise the performance degradation would be noticeable.
   */
  createSelects(c: ICompilerContext) {
    this.setParents();
    const blocks = getReversePostOrder(this.start);
    const writes = getWriterMap(c, this.start);
    const reads = getReaderMap(c, this.start);
    const maxDependencyCount = 2;

    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") continue;

      const { consequent, alternate, condition, source } = endInstruction;

      const consequentEnd = consequent.block.endInstruction;
      const alternateEnd = alternate.block.endInstruction;
      if (consequentEnd?.type !== "break" || alternateEnd?.type !== "break")
        continue;

      if (consequentEnd.target.block !== alternateEnd.target.block) continue;

      const mergeBlock = consequentEnd.target.block;

      for (let i = 0; i < mergeBlock.parameters.length; i++) {
        const consequentArg = consequentEnd.target.args[i];
        const alternateArg = alternateEnd.target.args[i];
        const consequentValue = consequentArg.value;
        const alternateValue = alternateArg.value;

        const total =
          getInstructionCount(consequentValue, consequent.block) +
          getInstructionCount(alternateValue, alternate.block);
        if (total > maxDependencyCount) continue;
        const hoistedInstructions = new Set<TBlockInstruction>();

        selectHoistedInstructions(
          hoistedInstructions,
          consequentValue,
          block,
          consequent.block,
        );
        selectHoistedInstructions(
          hoistedInstructions,
          alternateValue,
          block,
          alternate.block,
        );

        for (const node of alternate.block.instructions.nodes()) {
          const inst = node.instruction;
          if (hoistedInstructions.has(inst) || inst.type === "alloc-local") {
            alternate.block.instructions.remove(node);
            block.instructions.pushBack(inst);
            inst.unregisterWriter(writes);
            inst.registerWriter(writes, block);
          }
        }

        for (const node of consequent.block.instructions.nodes()) {
          const inst = node.instruction;
          if (hoistedInstructions.has(inst) || inst.type === "alloc-local") {
            consequent.block.instructions.remove(node);
            block.instructions.pushBack(inst);
            inst.unregisterWriter(writes);
            inst.registerWriter(writes, block);
          }
        }

        const out = c.createImmutableId();

        const select = new BinarySelectInstruction(
          condition,
          consequentValue,
          alternateValue,
          out,
          source,
        );
        block.instructions.pushBack(select);
        select.registerWriter(writes, block);
        consequentArg.value = out;
        alternateArg.value = out;
      }

      // jump directly to the merge block if both sides are identical
      if (!consequent.block.instructions.isEmpty) continue;
      if (!alternate.block.instructions.isEmpty) continue;

      let identical = true;
      for (let i = 0; i < mergeBlock.parameters.length; i++) {
        const consequentArg = consequentEnd.target.args[i];
        const alternateArg = alternateEnd.target.args[i];

        if (!consequentArg.value.equals(alternateArg.value)) {
          identical = false;
          break;
        }
      }

      if (!identical) continue;
      block.removeFromParents();
      block.endInstruction = new BreakInstruction(
        consequentEnd.target.clone(),
        source,
      );
      block.addToParents();

      alternate.block.removeFromParents();
      consequent.block.removeFromParents();
      alternate.block.endInstruction = new EndInstruction(source);
      consequent.block.endInstruction = new EndInstruction(source);

      if (mergeBlock.parents.length > 1) continue;

      // move instructions from mergeBlock into the current block
      // to maintain the "diamond" structure of the control flow graph
      // allowing the next iteration to identify more selects
      for (let i = 0; i < mergeBlock.parameters.length; i++) {
        const param = mergeBlock.parameters[i];
        const arg = block.endInstruction.target.args[i];
        c.setAlias(param.value, arg.value);
      }

      mergeBlock.parameters = [];

      for (const inst of mergeBlock.instructions) {
        block.instructions.pushBack(inst);
        inst.unregisterWriter(writes);
        inst.registerWriter(writes, block);
      }

      block.removeFromParents();
      block.endInstruction = mergeBlock.endInstruction;
      block.addToParents();

      mergeBlock.instructions.clear();
      mergeBlock.removeFromParents();
      mergeBlock.endInstruction = new EndInstruction(source);
    }

    // remove unnecessary block parameters
    const builder = new SSABuilder(c, this);
    builder.run();

    function getInstructionCount(id: ImmutableId, block: Block): number {
      if (writes.getBlock(id) !== block) return 0;
      const writer = writes.get(id);

      switch (writer?.type) {
        case undefined:
        case "load":
        case "load-literal":
        case "alloc-local":
          return 0;
        case "binary-operation": {
          let count = isBinaryOperationInlined(writer, reads) ? 0 : 1;
          count += getInstructionCount(writer.left, block);
          // don't calculate left side if we already exceed the max
          if (count > maxDependencyCount) return count;

          count += getInstructionCount(writer.right, block);
          return count;
        }
        case "unary-operation": {
          return 1 + getInstructionCount(writer.value, block);
        }
        case "binary-select": {
          let count = 1;
          count += getInstructionCount(writer.condition, block);
          // don't calculate left side if we already exceed the max
          if (count > maxDependencyCount) return count;

          count += getInstructionCount(writer.whenTrue, block);
          // don't calculate left side if we already exceed the max
          if (count > maxDependencyCount) return count;

          count += getInstructionCount(writer.whenFalse, block);
          return count;
        }
        default:
          return maxDependencyCount + 1;
      }
    }

    function selectHoistedInstructions(
      hoistedInstructions: Set<TBlockInstruction>,
      id: ImmutableId,
      parent: Block,
      block: Block,
    ) {
      if (writes.getBlock(id) !== block) return;
      const inst = writes.get(id);
      if (!inst) return;

      switch (inst.type) {
        case "load":
        case "load-literal":
        case "alloc-local":
          break;
        case "binary-operation":
          selectHoistedInstructions(
            hoistedInstructions,
            inst.left,
            parent,
            block,
          );
          selectHoistedInstructions(
            hoistedInstructions,
            inst.right,
            parent,
            block,
          );
          break;
        case "unary-operation":
          selectHoistedInstructions(
            hoistedInstructions,
            inst.value,
            parent,
            block,
          );
          break;
        case "binary-select":
          selectHoistedInstructions(
            hoistedInstructions,
            inst.condition,
            parent,
            block,
          );
          selectHoistedInstructions(
            hoistedInstructions,
            inst.whenTrue,
            parent,
            block,
          );
          selectHoistedInstructions(
            hoistedInstructions,
            inst.whenFalse,
            parent,
            block,
          );
          break;
        default:
          throw new CompilerError(
            "Attempted to hoist unsupported instruction",
            inst?.source,
          );
      }

      hoistedInstructions.add(inst);
    }
  }

  transformComparisons(c: ICompilerContext) {
    const writes = getWriterMap(c, this.start);
    traverse(this.start, block => {
      for (
        let current = block.instructions.head;
        current;
        current = current.next
      ) {
        const inst = current.instruction;
        if (inst.type !== "binary-operation") continue;
        const invert = (source: BinaryOperationInstruction) => {
          if (!source.isInvertible()) return;
          changed = true;
          inst.operator = source.operator;
          inst.left = source.left;
          inst.right = source.right;
          inst.invert();
        };

        const duplicate = (source: BinaryOperationInstruction) => {
          changed = true;
          // duplicating the source instruction
          // does is easier because the source
          // will be marked as unused and removed
          inst.operator = source.operator;
          inst.left = source.left;
          inst.right = source.right;
        };

        const remove = (value: number) => {
          changed = true;
          c.setValue(inst.out, new LiteralValue(value));

          const previous = current!.previous;
          block.instructions.remove(current!);
          current = previous ?? block.instructions.head;
        };

        let changed = false;
        do {
          changed = false;
          const source = writes.get(inst.left);
          const right = c.getValue(inst.right);

          if (
            !(source instanceof BinaryOperationInstruction) ||
            !(right instanceof LiteralValue)
          )
            break;

          switch (inst.operator) {
            case "equal":
            case "strictEqual": {
              if (right.num === 0) {
                invert(source);
              } else if (right.num === 1) {
                duplicate(source);
              } else {
                remove(0);
              }
              break;
            }
            case "notEqual": {
              if (right.num === 1) {
                invert(source);
              } else if (right.num === 0) {
                duplicate(source);
              } else {
                remove(1);
              }
              break;
            }
          }
        } while (changed);
      }
    });
  }

  removeUnusedInstructions(c: ICompilerContext) {
    const reads = getReaderMap(c, this.start);

    traversePostOrder(this.start, block => {
      let current = block.instructions.tail;

      while (current) {
        const { previous } = current;
        const inst = current.instruction;

        // TODO: remove calls to functions with no side effects
        // TODO: handle value-get instructions
        switch (inst.type) {
          case "load":
          case "binary-operation":
          case "unary-operation": {
            const readers = reads.get(inst.out);
            if (readers.size !== 0) break;
            block.instructions.remove(current);
            inst.unregisterReader(reads);
          }
        }
        current = previous;
      }
    });
  }

  optimizeGlobals(c: ICompilerContext) {
    const contexts = new Map<Block, Map<GlobalId, ImmutableId>>();
    traverseReversePostOrder(this.start, block => {
      // const context = new Map<GlobalId, ImmutableId>();

      const context =
        block.parents.length === 1
          ? contexts.get(block.parents[0])!
          : new Map<GlobalId, ImmutableId>();

      contexts.set(block, context);

      let current = block.instructions.head;

      while (current) {
        const inst = current.instruction;
        switch (inst.type) {
          case "store": {
            const { address, value } = inst;
            context.set(address, value);
            current = current.next;
            break;
          }
          case "load": {
            const { address, out } = inst;
            const preserved = context.get(address);
            if (!preserved) break;
            c.setAlias(out, preserved);
            const { next } = current;
            block.instructions.remove(current);
            current = next;
            break;
          }
          default:
            current = current.next;
        }
      }
    });
  }

  /** Must be called at the end of the process */
  optimizeImmediateStores(c: ICompilerContext) {
    // const reads = getReaderMap(this.start);
    const writes = getWriterMap(c, this.start);

    traverse(this.start, block => {
      let previousInstruction = block.instructions.head?.instruction;
      let current = block.instructions.head?.next;

      while (current) {
        const inst = current.instruction;
        if (inst.type !== "store") {
          previousInstruction = inst;
          current = current.next;
          continue;
        }

        const writer = writes.get(inst.value);
        if (writer === previousInstruction) {
          c.setGlobalAlias(inst.value, inst.address);
        }
        current = current.next;
      }
    });
  }

  /**
   * Optimizes load instructions that are immediately followed by the only
   * instruction that reads their value.
   */
  optimizeImmediateLoads(c: ICompilerContext) {
    const reads = getReaderMap(c, this.start);

    traverse(this.start, block => {
      let lastInstruction = block.instructions.tail?.instruction;

      for (
        let current = block.instructions.tail?.previous;
        current;
        current = current.previous
      ) {
        const inst = current.instruction;
        if (inst.type !== "load") {
          lastInstruction = inst;
          continue;
        }
        const readers = reads.get(inst.out);
        if (readers.size === 1 && readers.has(lastInstruction!)) {
          c.setGlobalAlias(inst.out, inst.address);
        }
      }
    });
  }

  constructSSA(c: ICompilerContext) {
    this.setParents();
    const builder = new SSABuilder(c, this);

    builder.run();
  }

  deconstructSSA(c: ICompilerContext) {
    this.setParents();
    // remove any trivial block parameters left
    const builder = new SSABuilder(c, this);
    builder.run();

    const orderedBlocks = getReversePostOrder(this.start);

    for (let i = orderedBlocks.length - 1; i >= 0; i--) {
      const block = orderedBlocks[i];

      for (const param of block.parameters) {
        c.setGlobalAlias(param.value, param.variable);
        block.instructions.pushFront(
          new LoadInstruction(param.variable, param.value, param.loc),
        );
      }

      for (let i = 0; i < block.parameters.length; i++) {
        const blockParam = block.parameters[i];

        for (const parent of block.parents) {
          const endInst = parent.endInstruction;
          if (endInst?.type !== "break") {
            console.log(endInst, block.parameters);
            throw new CompilerError(
              "Unexpected control flow during SSA deconstruction",
            );
          }

          const arg = endInst.target.args[i];
          parent.instructions.pushBack(
            new StoreInstruction(blockParam.variable, arg.value, arg.loc),
          );
        }
      }

      block.parameters.length = 0;
      for (const parent of block.parents) {
        const endInstruction = parent.endInstruction;
        if (endInstruction?.type !== "break") continue;
        endInstruction.target.args.length = 0;
      }
    }
  }

  eliminateCommonSubexpressions(c: ICompilerContext) {
    this.setParents();
    const idoms = immediateDominators(this.start);
    const expressions = new Map<Block, Map<string, ImmutableId>>();

    traverseReversePostOrder(this.start, block => {
      const idom = idoms.get(block);
      const blockExpressions = new Map<string, ImmutableId>(
        idom ? expressions.get(idom) : null,
      );
      expressions.set(block, blockExpressions);

      for (const node of block.instructions.nodes()) {
        const inst = node.instruction;

        if (
          inst.type === "binary-operation" ||
          inst.type === "unary-operation" ||
          inst.type === "binary-select" ||
          inst.type === "load-literal"
        ) {
          const key = inst.getExpressionKey(c);
          const existing = blockExpressions.get(key);

          if (existing) {
            c.setAlias(inst.out, existing);
            block.instructions.remove(node);
            continue;
          } else {
            blockExpressions.set(key, inst.out);
          }
        }
      }
    });
  }

  optimize(c: ICompilerContext) {
    // hoisting load-literal instructions here
    // allows skipBlocks and removeCriticalEdges
    // to work better
    this.hoistLoadLiterals(c);
    this.mergeBlocks();
    this.skipBlocks();
    this.removeCriticalEdges();
    this.splitLeaves();
    this.constructSSA(c);
    this.skipBlocks();
    this.removeCriticalEdges();

    this.canonicalizeBinaryOperations(c);
    // this.optimizeGlobals(c);
    this.foldConstantOperations(c);
    this.hoistLoadLiterals(c);
    this.transformComparisons(c);
    this.createSelects(c);
    this.eliminateCommonSubexpressions(c);
    this.removeUnusedInstructions(c);
    // this.optimizeStoreInstructions(c);
    this.createEndIfs(c);
    this.removeConstantBreakIfs(c);
    this.removeConstantEndIfs(c);

    this.deconstructSSA(c);
    this.canonicalizeBreakIfs(c);
    this.transformComparisons(c);
    this.flipBreakIfs(c);
    this.removeUnusedInstructions(c);
    this.skipBlocks();

    // TODO: fix updating of block parents during
    // the previous optimizations
    // console.log(generateGraphVizDOTString(c, this.start));
    // console.log(dominators(this.start));
    // console.log(dominanceFrontier(this.start, dominators(this.start)));
  }

  clone(c: ICompilerContext) {
    const clone = new Graph();
    const blockMap = new Map<Block, Block>();

    traverse(this.start, block => {
      const newBlock = new Block();
      blockMap.set(block, newBlock);
    });

    traverse(this.start, block => {
      const newBlock = blockMap.get(block)!;
      for (const edge of block.childEdges) {
        const newTarget = blockMap.get(edge.block)!;
        newBlock.childEdges.push(
          new BlockEdge(edge.type, newTarget, [...edge.args]),
        );
      }
    });

    clone.start = blockMap.get(this.start)!;

    return clone;
  }
}

export function traverse(block: Block, action: (block: Block) => void) {
  const visited = new Set<Block>();
  function _traverse(block: Block) {
    if (visited.has(block)) return;
    visited.add(block);

    action(block);
    for (const edge of block.childEdges) {
      if (edge.type === "backward") continue;
      _traverse(edge.block);
    }
  }

  _traverse(block);
}

export function getReversePostOrder(entry: Block): Block[] {
  const order: Block[] = [];
  const visited = new Set<Block>();

  function _traverse(block: Block) {
    if (visited.has(block)) return;

    visited.add(block);
    const edges = block.childEdges;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      if (edge.type === "backward") continue;
      _traverse(edge.block);
    }

    order.push(block);
  }

  _traverse(entry);

  return order.reverse();
}

export function traverseReversePostOrder(
  entry: Block,
  action: (block: Block) => void,
) {
  const order = getReversePostOrder(entry);

  for (let i = 0; i < order.length; i++) {
    action(order[i]);
  }
}

export function traversePostOrder(
  entry: Block,
  action: (block: Block) => void,
) {
  const visited = new Set<Block>();
  function _traverse(block: Block) {
    if (visited.has(block)) return;
    visited.add(block);

    for (const edge of block.childEdges) {
      if (edge.type === "backward") continue;
      _traverse(edge.block);
    }

    action(block);
  }

  _traverse(entry);
}

/** Requires parent information. */
function immediateDominators(entry: Block): Map<Block, Block> {
  const idoms = new Map<Block, Block>();
  const blockIndexes = new Map<Block, number>();
  const allBlocks: Block[] = getReversePostOrder(entry);
  for (let i = 0; i < allBlocks.length; i++) {
    blockIndexes.set(allBlocks[i], i);
  }

  idoms.set(entry, entry);

  let changed = true;
  while (changed) {
    changed = false;
    for (const block of allBlocks) {
      if (block === entry) continue;

      const parents = block.parents;
      let newIdom = parents[0];

      for (let i = 1; i < parents.length; i++) {
        const parent = parents[i];
        if (idoms.has(parent)) {
          newIdom = intersect(newIdom, parent);
        }
      }

      if (idoms.get(block) !== newIdom) {
        idoms.set(block, newIdom);
        changed = true;
      }
    }
  }
  return idoms;

  function intersect(a: Block, b: Block): Block {
    let aIndex = blockIndexes.get(a)!;
    let bIndex = blockIndexes.get(b)!;

    while (aIndex !== bIndex) {
      while (aIndex > bIndex) {
        aIndex = blockIndexes.get(idoms.get(allBlocks[aIndex])!)!;
      }
      while (bIndex > aIndex) {
        bIndex = blockIndexes.get(idoms.get(allBlocks[bIndex])!)!;
      }
    }

    // if they are the same, return undefined
    return allBlocks[aIndex];
  }
}

function dominanceFrontier(
  entry: Block,
  idoms: Map<Block, Block>,
): Map<Block, Set<Block>> {
  const frontiers = new Map<Block, Set<Block>>();
  traverse(entry, block => frontiers.set(block, new Set<Block>()));

  traverseReversePostOrder(entry, block => {
    frontiers.set(block, new Set<Block>());

    const { parents } = block;
    if (parents.length < 2) return;
    const idom = idoms.get(block)!;

    for (const parent of parents) {
      let runner = parent;

      while (runner !== idom) {
        frontiers.get(runner)!.add(block);
        runner = idoms.get(runner)!;
      }
    }
  });
  return frontiers;
}

function getWriterMap(c: ICompilerContext, entry: Block): WriterMap {
  const sources = new WriterMap(c);

  traverse(entry, block => {
    for (const inst of block.instructions) {
      inst.registerWriter(sources, block);
    }
  });

  return sources;
}

function getReaderMap(c: ICompilerContext, entry: Block): ReaderMap {
  const reads = new ReaderMap(c);
  traverse(entry, block => {
    for (const inst of block.instructions) {
      inst.registerReader(reads);
    }
    switch (block.endInstruction?.type) {
      case "break":
        for (const arg of block.endInstruction.target.args) {
          reads.add(arg.value, block.endInstruction);
        }
        break;
      case "break-if":
      case "end-if":
        reads.add(block.endInstruction.condition, block.endInstruction);
        break;
      case "return":
        reads.add(block.endInstruction.value, block.endInstruction);
        break;
    }
  });

  return reads;
}
