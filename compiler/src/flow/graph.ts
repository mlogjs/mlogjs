import { BlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  InstructionBase,
  JumpInstruction,
} from "../instructions";
import { SourceRange } from "../SourceRange";
import { IBindableValue, IInstruction } from "../types";
import { LiteralValue, StoreValue } from "../values";
import { Block, TEdge } from "./block";
import { GlobalId, ImmutableId } from "./id";
import {
  BinaryOperationInstruction,
  BreakInstruction,
  EndIfInstruction,
  EndInstruction,
  LoadInstruction,
  StoreInstruction,
  TBlockEndInstruction,
  isLowerable,
} from "./instructions";
import { ReaderMap, WriterMap } from "./optimizer";
import {
  generateGraphVizDOTString,
  visualizeImmediateDominators,
} from "./visualize";

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
    const visited = new Set<Block>();
    const addresses = new Map<Block, IBindableValue<number | null>>();

    traverse(this.start, block => {
      addresses.set(block, new LiteralValue(null));
    });

    const flatten = (block: Block) => {
      if (visited.has(block)) return;
      const { forwardParents } = block;

      if (!forwardParents.every(parent => visited.has(parent))) {
        return;
      }
      visited.add(block);
      instructions.push(new AddressResolver(addresses.get(block)!));
      // instructions.push(new InstructionBase("blockstart"));
      instructions.push(...block.toMlog(c));
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
          const conditionInst = block.conditionInstruction();
          const { consequent, alternate, source } = endInstruction;
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
          break;
        }
        case "end-if": {
          const condition = c.getValue(endInstruction.condition);
          const conditionInst = block.conditionInstruction();
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

      // there are at most two children
      // and because of how break-if is implemented
      // having the alternate branch before the consequent branch
      // reduces the amount of instructions needed
      for (let i = block.childEdges.length - 1; i >= 0; i--) {
        const edge = block.childEdges[i];
        if (edge.type === "backward") continue;
        // for (let i = 0; i < block.children.length; i++) {
        flatten(edge.block);
      }
    };

    flatten(this.start);

    return instructions;
  }

  /**
   * Attempts to put empty instruction blocks on the consequent side of break-if
   * instructions in order to reduce the amount of jumps present in the
   * generated code. This is done because an empty block usually contains a jump
   * or an end instruction, and in the first case that jump being on the
   * alternate side of the break-if neutralizes the benefit of eliminating a
   * jump caused by placing alternate blocks first.
   */
  canonicalizeBreakIfs(c: ICompilerContext) {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;

      // checking like this is required because there are no critical
      // edges at this point in the optimization pipeline
      const isBackBreak = (end: TBlockEndInstruction | undefined) =>
        end?.type === "break" && end?.target.type === "backward";

      if (!alternate.block.instructions.isEmpty) return;

      // canonicalization doesn't really outside these cases
      // so it just makes the generated code harder to read
      switch (alternate.block.endInstruction?.type) {
        case "break":
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
      endInstruction.alternate = consequent;
      endInstruction.consequent = alternate;
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
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;

      const conditionInst = block.conditionInstruction();

      if (
        conditionInst?.operator !== "equal" ||
        // don't un-canonicalize break-ifs
        consequent.block.instructions.length === 0
      )
        return;
      const right = c.getValue(conditionInst.right);
      if (!(right instanceof LiteralValue) || right.data !== 0) return;
      endInstruction.condition = conditionInst.left;
      endInstruction.alternate = consequent;
      endInstruction.consequent = alternate;
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

      if (!consequent.block.instructions.isEmpty) return;
      if (consequent.block.endInstruction?.type !== "end") return;

      let target = alternate;

      // if there is an empty block here
      // it was created to prevent a critical edge
      // but now that the current block will only have one child
      // we don't need the empty block anymore
      if (
        alternate.block.instructions.isEmpty &&
        alternate.block.endInstruction?.type === "break"
      ) {
        target = alternate.block.endInstruction.target;
      }

      block.endInstruction = new EndIfInstruction(
        condition,
        target,
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

  foldConstantOperations(c: ICompilerContext) {
    traverse(this.start, block => {
      let current = block.instructions.head;

      while (current) {
        const inst = current.instruction;
        if (
          inst.type !== "binary-operation" &&
          inst.type !== "unary-operation"
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
    // const idoms = immediateDominators(this.start);
    // const frontiers = dominanceFrontier(this.start, idoms);
    const orderedBlocks = getReversePostOrder(this.start);
    const currentValues = new Map<Block, Map<GlobalId, ImmutableId>>();
    const valueLocations = new Map<ImmutableId, SourceRange>();
    const sealedBlocks = new Set<Block>();
    const neverId = c.registerValue(
      new LiteralValue("You should never see this"),
    );

    for (const block of orderedBlocks) {
      currentValues.set(block, new Map());
    }

    function writeVariable(
      variable: GlobalId,
      block: Block,
      value: ImmutableId,
      loc: SourceRange,
    ) {
      currentValues.get(block)!.set(variable, value);
      if (!valueLocations.has(value)) {
        valueLocations.set(value, loc);
      }
    }

    function readVariable(
      variable: GlobalId,
      block: Block,
      loc: SourceRange,
    ): ImmutableId {
      if (currentValues.get(block)!.has(variable)) {
        return currentValues.get(block)!.get(variable)!;
      }

      return readVariableRecursive(variable, block, loc);
    }

    function readVariableRecursive(
      variable: GlobalId,
      block: Block,
      loc: SourceRange,
    ): ImmutableId {
      let val: ImmutableId;
      if (!sealedBlocks.has(block)) {
        val = c.createImmutableId();
        valueLocations.set(val, loc);
        block.parameters.push({ variable, value: val, loc });

        // mark as incomplete and patch later on
        for (const parent of block.parents) {
          const endInst = parent.endInstruction;
          if (endInst?.type !== "break" && endInst?.type !== "break-if") {
            throw new CompilerError("Unexpected control flow during mem2reg");
          }

          endInst.addBlockParameter(block, { value: neverId, loc });
        }
      } else if (block.parents.length === 1) {
        val = readVariable(variable, block.parents[0], loc);
      } else {
        const pairs: { end: BreakInstruction; value: ImmutableId }[] = [];
        for (const parent of block.parents) {
          const parentValue = readVariable(variable, parent, loc);

          const { endInstruction } = parent;
          if (endInstruction?.type !== "break") {
            throw new CompilerError("Unexpected control flow during mem2reg");
          }
          pairs.push({ end: endInstruction, value: parentValue });
        }

        const firstId = pairs[0].value;
        if (pairs.every(({ value }) => value.equals(firstId))) {
          val = firstId;
        } else {
          val = c.createImmutableId();
          valueLocations.set(val, loc);
          block.parameters.push({ variable: variable, value: val, loc });
          for (const { end, value } of pairs) {
            end.blockParameters.push({ value, loc });
          }
        }
      }

      writeVariable(variable, block, val, loc);
      return val;
    }

    // perform mem2reg conversion
    for (const block of orderedBlocks) {
      const currentMap = new Map();
      currentValues.set(block, currentMap);

      for (const node of block.instructions.nodes()) {
        const inst = node.instruction;
        if (inst.type === "store") {
          writeVariable(inst.address, block, inst.value, inst.source);
          block.instructions.remove(node);
        } else if (inst.type === "load") {
          const value = readVariable(inst.address, block, inst.source);
          c.setAlias(inst.out, value);
          block.instructions.remove(node);
          // const { address, out } = inst;
          // const currentValue = currentMap.get(address);
          // if (currentValue) {
          //   c.setAlias(out, currentValue);
          // } else {
          //   const newValue = c.createImmutableId();
          //   block.parameters.push({ source: address, value: newValue });
          //   c.setAlias(out, newValue);
          //   currentMap.set(address, newValue);
          // }

          // // block.instructions.remove(node);
        }
      }

      sealedBlocks.add(block);

      const endInstruction = block.endInstruction;
      if (endInstruction?.type !== "break") continue;

      // patch incomplete block parameters
      for (let i = 0; i < endInstruction.blockParameters.length; i++) {
        const param = endInstruction.blockParameters[i];
        if (!param.value.equals(neverId)) continue;
        const variable = endInstruction.target.block.parameters[i].variable;
        const value = readVariable(variable, block, param.loc);
        endInstruction.blockParameters[i] = { value, loc: param.loc };
      }
    }

    // remove trivial block parameters
    for (const block of orderedBlocks) {
      for (let i = block.parameters.length - 1; i >= 0; i--) {
        const param = block.parameters[i];
        const allSame = block.parents.every(parent => {
          const endInst = parent.endInstruction;
          if (endInst?.type !== "break") {
            throw new CompilerError(
              "Unexpected control flow during SSA deconstruction",
            );
          }
          const value = endInst.blockParameters[i];
          return value.value.equals(param.value);
        });

        if (allSame) {
          block.parameters.splice(i, 1);
          for (const parent of block.parents) {
            const endInst = parent.endInstruction as BreakInstruction;
            endInst.blockParameters.splice(i, 1);
          }
        }
      }
    }
  }

  deconstructSSA(c: ICompilerContext) {
    const orderedBlocks = getReversePostOrder(this.start);
    const writers = getWriterMap(c, this.start);

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

        console.log(
          c.getValue(blockParam.value),
          c.getValue(blockParam.variable),
        );
        // c.setGlobalAlias(param.value, param.source);

        for (const parent of block.parents) {
          const endInst = parent.endInstruction;
          if (endInst?.type !== "break") {
            console.log(endInst, block.parameters);
            throw new CompilerError(
              "Unexpected control flow during SSA deconstruction",
            );
          }

          const instParam = endInst.blockParameters[i];
          const value = c.getValue(instParam.value);

          if (
            !c.getValueName(instParam.value) &&
            (!value || value instanceof StoreValue)
          ) {
            c.setAlias(instParam.value, blockParam.value);
          }
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

      // if (endInstruction?.type !== "break") continue;

      // for (let i = 0; i < endInstruction.blockParameters.length; i++) {
      //   const value = endInstruction.blockParameters[i];
      //   const variable = endInstruction.target.block.parameters[i].source;

      //   const storeInst = new StoreInstruction(variable, value);
      //   block.instructions.pushBack(storeInst);
      // }
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
    this.canonicalizeBreakIfs(c);
    this.foldConstantOperations(c);
    this.transformComparisons(c);
    this.flipBreakIfs(c);
    this.setParents();
    this.removeUnusedInstructions(c);
    // this.optimizeStoreInstructions(c);
    this.createEndIfs(c);
    this.removeConstantBreakIfs(c);
    this.removeConstantEndIfs(c);
    this.setParents();
    this.deconstructSSA(c);
    console.log(generateGraphVizDOTString(c, this.start));
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

    // iterating backwards to preserve their relative order
    for (let i = edges.length - 1; i >= 0; i--) {
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
      inst.registerWriter(sources);
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
