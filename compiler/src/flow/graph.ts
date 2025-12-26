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
import { Block, TEdge } from "./block";
import { GlobalId, ImmutableId } from "./id";
import {
  BinaryOperationInstruction,
  BinarySelectInstruction,
  BreakInstruction,
  EndIfInstruction,
  EndInstruction,
  IBreakParameter,
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
  end = new Block();

  static from(entry: Block, exit: Block, loc: SourceRange) {
    const graph = new Graph();
    graph.start = entry;
    graph.end = exit;

    traverse(graph.start, block => {
      block.endInstruction ??= new BreakInstruction(graph.end, loc);
    });

    graph.setParents();

    return graph;
  }

  setParents() {
    traverse(this.start, block => {
      block.parents = [];
    });
    traverse(this.start, block => {
      block.children.forEach(child => child.addParent(block));
    });
  }

  removeCriticalEdges() {
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

      const { consequent, alternate, source } = block.endInstruction;

      if (consequent.block.parents.length > 1) {
        const newBlock = new Block(new BreakInstruction(consequent, source));
        newBlock.endInstruction!.source = block.endInstruction.source;
        newBlock.addParent(block);
        consequent.block.removeParent(block);
        consequent.block.addParent(newBlock);
        block.endInstruction.consequent = newBlock.toForward();
      }

      if (alternate.block.parents.length > 1) {
        const newBlock = new Block(new BreakInstruction(alternate, source));
        newBlock.endInstruction!.source = block.endInstruction.source;

        newBlock.addParent(block);
        alternate.block.removeParent(block);
        alternate.block.addParent(newBlock);
        block.endInstruction.alternate = newBlock.toForward();
      }
    }
  }

  mergeBlocks() {
    traverse(this.start, block => {
      while (block.endInstruction?.type === "break") {
        const { target } = block.endInstruction;
        if (target.block.parents.length !== 1) break;

        for (const inst of target.block.instructions) {
          block.instructions.pushBack(inst);
        }

        block.endInstruction = target.block.endInstruction;
        target.block.children.forEach(child => {
          child.removeParent(target.block);
          child.addParent(block);
        });
        if (target.block === this.end) this.end = block;
      }
    });
  }

  /**
   * Does not take block parameters into account. Only call before SSA
   * construction or after SSA deconstruction.
   */
  skipBlocks() {
    function tryToRedirect(block: Block, oldTarget: TEdge) {
      let current = oldTarget;

      while (
        current.block.endInstruction?.type === "break" &&
        current.block.instructions.isEmpty &&
        current.block.forwardParents.length === current.block.parents.length
      ) {
        current = current.block.endInstruction.target;
      }

      if (current === oldTarget) return;
      const newTarget = current;
      newTarget.block.addParent(block);
      oldTarget.block.removeParent(block);
      return newTarget;
    }

    traverse(this.start, block => {
      switch (block.endInstruction?.type) {
        case "break": {
          const newTarget = tryToRedirect(block, block.endInstruction.target);
          if (!newTarget) break;
          block.endInstruction.target = newTarget;
          break;
        }
        case "break-if": {
          const { consequent, alternate } = block.endInstruction;
          const newConsequent = tryToRedirect(block, consequent);
          const newAlternate = tryToRedirect(block, alternate);
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

      let preservedEdge: TEdge;
      let params: IBreakParameter[];

      if (
        consequent.block.instructions.isEmpty &&
        consequent.block.endInstruction?.type === "end"
      ) {
        preservedEdge = alternate;
        params = endInstruction.alternateParameters;
      } else if (
        alternate.block.instructions.isEmpty &&
        alternate.block.endInstruction?.type === "end"
      ) {
        preservedEdge = consequent;
        params = endInstruction.consequentParameters;
      } else {
        return;
      }

      block.endInstruction = new EndIfInstruction(
        condition,
        preservedEdge,
        endInstruction.source,
      );
      block.endInstruction.alternateParameters = params;
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

  foldConstantOperations(c: ICompilerContext) {
    traverse(this.start, block => {
      let current = block.instructions.head;

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

        if (!inst.constantFold(c)) {
          current = current.next;
          continue;
        }

        const { next } = current;
        block.instructions.remove(current);
        current = next;
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
        const consequentParam = consequentEnd.blockParameters[i];
        const alternateParam = alternateEnd.blockParameters[i];
        const consequentValue = consequentParam.value;
        const alternateValue = alternateParam.value;

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
        consequentParam.value = out;
        alternateParam.value = out;
      }

      using _ = {
        [Symbol.dispose]: () => {
          console.log(
            "select step: ",
            generateGraphVizDOTString(c, this.start),
          );
        },
      };

      // jump directly to the merge block if both sides are identical
      if (!consequent.block.instructions.isEmpty) continue;
      if (!alternate.block.instructions.isEmpty) continue;

      let identical = true;
      for (let i = 0; i < mergeBlock.parameters.length; i++) {
        const consequentParam = consequentEnd.blockParameters[i];
        const alternateParam = alternateEnd.blockParameters[i];

        if (!consequentParam.value.equals(alternateParam.value)) {
          identical = false;
          break;
        }
      }

      if (!identical) continue;
      block.endInstruction = new BreakInstruction(mergeBlock, source);
      block.endInstruction.blockParameters = [...consequentEnd.blockParameters];
      alternate.block.endInstruction = new EndInstruction(source);
      consequent.block.endInstruction = new EndInstruction(source);
      mergeBlock.addParent(block);
      mergeBlock.removeParent(consequent.block);
      mergeBlock.removeParent(alternate.block);

      // move instruction from mergeBlock into current block
      // to maintain the "diamond" structure of the control flow graph
      // allowing the next iteration to identify more selects
      if (mergeBlock.parents.length > 1) continue;

      for (let i = 0; i < mergeBlock.parameters.length; i++) {
        const param = mergeBlock.parameters[i];
        const breakParam = block.endInstruction.blockParameters[i];
        c.setAlias(param.value, breakParam.value);
      }

      mergeBlock.parameters = [];

      for (const inst of mergeBlock.instructions) {
        block.instructions.pushBack(inst);
        inst.unregisterWriter(writes);
        inst.registerWriter(writes, block);
      }

      block.endInstruction = mergeBlock.endInstruction;
      mergeBlock.children.forEach(child => {
        child.removeParent(mergeBlock);
        child.addParent(block);
      });

      mergeBlock.parents = [];
      mergeBlock.instructions.clear();
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
    const builder = new SSABuilder(c, this);

    builder.run();
  }

  deconstructSSA(c: ICompilerContext) {
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

          const instParam = endInst.blockParameters[i];
          parent.instructions.pushBack(
            new StoreInstruction(
              blockParam.variable,
              instParam.value,
              instParam.loc,
            ),
          );
        }
      }

      block.parameters.length = 0;
      for (const parent of block.parents) {
        const endInstruction = parent.endInstruction;
        if (endInstruction?.type !== "break") continue;
        endInstruction.blockParameters.length = 0;
      }
    }
  }

  optimize(c: ICompilerContext) {
    this.setParents();
    this.mergeBlocks();
    this.skipBlocks();
    this.setParents();
    this.removeCriticalEdges();
    this.splitLeaves();
    this.constructSSA(c);

    this.canonicalizeBinaryOperations(c);
    // this.optimizeGlobals(c);
    this.foldConstantOperations(c);
    this.transformComparisons(c);
    this.createSelects(c);
    this.setParents();
    this.removeUnusedInstructions(c);
    // this.optimizeStoreInstructions(c);
    this.createEndIfs(c);
    this.removeConstantBreakIfs(c);
    this.removeConstantEndIfs(c);
    this.setParents();
    console.log(generateGraphVizDOTString(c, this.start));

    this.deconstructSSA(c);
    this.canonicalizeBreakIfs(c);
    this.transformComparisons(c);
    this.flipBreakIfs(c);
    this.removeUnusedInstructions(c);
    this.skipBlocks();

    // TODO: fix updating of block parents during
    // the previous optimizations
    this.setParents();
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
        newBlock.childEdges.push({ ...edge, block: newTarget });
      }
    });

    clone.start = blockMap.get(this.start)!;
    clone.end = blockMap.get(this.end)!;

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

function immediateDominators(entry: Block): Map<Block, Block> {
  const idoms = new Map<Block, Block>();
  const blockIndexes = new Map<Block, number>();
  const allBlocks: Block[] = [];
  traverseReversePostOrder(entry, block => {
    blockIndexes.set(block, allBlocks.length);
    allBlocks.push(block);
  });

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
        for (const param of block.endInstruction.blockParameters) {
          reads.add(param.value, block.endInstruction);
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
