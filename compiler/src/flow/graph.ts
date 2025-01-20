import { BlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  InstructionBase,
  JumpInstruction,
} from "../instructions";
import { IBindableValue, IInstruction } from "../types";
import { LiteralValue } from "../values";
import { Block, TEdge } from "./block";
import { GlobalId, ImmutableId } from "./id";
import {
  BinaryOperationInstruction,
  BreakInstruction,
  EndIfInstruction,
  EndInstruction,
  TBlockEndInstruction,
  isLowerable,
} from "./instructions";
import { ReaderMap, WriterMap } from "./optimizer";

//  TODO: handle multiple leaf blocks (necessary because end and stop exist)
// control flow graph internals for the compiler
export class Graph {
  start = new Block();
  end = new Block();

  static from(entry: Block, exit: Block) {
    const graph = new Graph();
    graph.start = entry;
    graph.end = exit;

    traverse(graph.start, block => {
      block.endInstruction ??= new BreakInstruction(graph.end);
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
      const block = queue[0];
      if (visited.has(block)) {
        queue.shift();
        continue;
      }
      visited.add(block);
      const children = block.children;

      queue.push(...children);

      if (block.endInstruction?.type !== "break-if") {
        queue.shift();
        continue;
      }

      const { consequent, alternate } = block.endInstruction;

      if (
        consequent.block.parents.length === 1 &&
        alternate.block.parents.length === 1
      ) {
        queue.shift();
        continue;
      }

      if (consequent.block.parents.length > 1) {
        const newBlock = new Block(new BreakInstruction(consequent));
        newBlock.endInstruction!.source = block.endInstruction.source;
        newBlock.addParent(block);
        consequent.block.removeParent(block);
        consequent.block.addParent(newBlock);
        block.endInstruction.consequent = newBlock.toForward();
      }

      if (alternate.block.parents.length > 1) {
        const newBlock = new Block(new BreakInstruction(alternate));
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
          block.instructions.add(inst);
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
        if (isLowerable(inst)) {
          cursor.position = node;
          inst.lower(c, cursor);
          cursor.position = node;
          cursor.removeInstruction();
        }
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

      const newCondition = new ImmutableId();
      block.instructions.add(
        new BinaryOperationInstruction(
          "equal",
          endInstruction.condition,
          c.registerValue(new LiteralValue(0)),
          newCondition,
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

      block.endInstruction = new EndIfInstruction(condition, alternate);
      block.endInstruction.source = endInstruction.source;
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
      );
      newBreak.source = endInstruction.source;
      block.endInstruction = newBreak;
    });
  }

  removeConstantEndIfs(c: ICompilerContext) {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "end-if") return;
      const condition = c.getValue(endInstruction.condition);
      if (!(condition instanceof LiteralValue)) return;

      const loc = block.endInstruction?.source;
      if (condition.num) {
        block.endInstruction = new EndInstruction({ loc });
      } else {
        block.endInstruction = new BreakInstruction(endInstruction.alternate, {
          loc,
        });
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
    traverseParentsFirst(this.start, block => {
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
    const writes = getWriterMap(this.start);

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

  optimize(c: ICompilerContext) {
    this.setParents();
    this.mergeBlocks();
    this.skipBlocks();
    this.setParents();
    this.removeCriticalEdges();
    this.splitLeaves();
    this.canonicalizeBinaryOperations(c);
    // this.optimizeGlobals(c);
    this.canonicalizeBreakIfs(c);
    this.foldConstantOperations(c);
    this.transformComparisons(c);
    this.flipBreakIfs(c);
    this.createEndIfs(c);

    // this.optimizeStoreInstructions(c);
    this.removeConstantBreakIfs(c);
    this.removeConstantEndIfs(c);
    this.optimizeImmediateLoads(c);
    this.optimizeImmediateStores(c);
    this.setParents();
    this.skipBlocks();

    // TODO: fix updating of block parents during
    // the previous optimizations
    this.setParents();
    // console.log(dominators(this.start));
    // console.log(dominanceFrontier(this.start, dominators(this.start)));
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

export function traverseParentsFirst(
  entry: Block,
  action: (block: Block) => void,
) {
  const visited = new Set<Block>();

  function _traverse(block: Block) {
    if (!block.forwardParents.every(parent => visited.has(parent))) return;

    visited.add(block);
    action(block);

    for (const edge of block.childEdges) {
      if (edge.type === "backward") continue;
      _traverse(edge.block);
    }
  }

  _traverse(entry);
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

function dominators(entry: Block): Map<Block, Set<Block>> {
  const doms = new Map<Block, Set<Block>>();

  traverse(entry, block => {
    doms.set(block, new Set([block]));
  });

  traverseParentsFirst(entry, block => {
    const { forwardParents } = block;
    if (forwardParents.length === 0) return;
    const d = doms.get(block)!;

    const common = intersectSets(...forwardParents.map(p => doms.get(p)!));
    for (const c of common) {
      d.add(c);
    }
  });

  return doms;
}

function dominanceFrontier(
  entry: Block,
  doms: Map<Block, Set<Block>>,
): Map<Block, Set<Block>> {
  const frontiers = new Map<Block, Set<Block>>();

  function df(x: Block) {
    // console.log("df", x);
    if (frontiers.has(x)) return frontiers.get(x)!;

    const s = new Set<Block>();
    const dx = doms.get(x)!;
    for (const y of x.children) {
      if (!dx.has(y) && x !== y) {
        s.add(y);
      }
    }
    for (const k of x.children) {
      if (!dx.has(k)) continue;
      for (const y of df(k)) {
        if (!dx.has(y)) {
          s.add(y);
        }
      }
    }
    frontiers.set(x, s);
    return s;
  }

  df(entry);

  return frontiers;
}

function intersectSets<T>(...sets: Set<T>[]) {
  const result = new Set<T>();
  const [first, ...rest] = sets;
  for (const item of first) {
    if (rest.every(set => set.has(item))) {
      result.add(item);
    }
  }
  return result;
}

function getWriterMap(entry: Block): WriterMap {
  const sources = new WriterMap();

  traverse(entry, block => {
    for (const inst of block.instructions) {
      inst.registerWriter(sources);
    }
  });

  return sources;
}

function getReaderMap(entry: Block): ReaderMap {
  const reads = new ReaderMap();
  traverse(entry, block => {
    for (const inst of block.instructions) {
      inst.registerReader(reads);
    }
    switch (block.endInstruction?.type) {
      case "break-if":
        reads.add(block.endInstruction.condition, block.endInstruction);
        break;
      case "return":
        reads.add(block.endInstruction.value, block.endInstruction);
        break;
    }
  });

  return reads;
}
