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
import { ImmutableId } from "./id";
import { BinaryOperationInstruction, BreakInstruction } from "./instructions";

// control flow graph internals for the compiler
export class Graph {
  start = new Block([]);
  end = new Block([]);

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
        const newBlock = new Block([], new BreakInstruction(consequent));
        newBlock.endInstruction!.source = block.endInstruction.source;
        newBlock.addParent(block);
        consequent.block.removeParent(block);
        consequent.block.addParent(newBlock);
        block.endInstruction.consequent = newBlock.toForward();
      }

      if (alternate.block.parents.length > 1) {
        const newBlock = new Block([], new BreakInstruction(alternate));
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
        block.instructions.push(...target.block.instructions);
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
        current.block.instructions.length === 0
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

  toMlog(c: ICompilerContext) {
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
        // case "end": {
        //   if (block !== this.end || true) {
        //     instructions.push(new InstructionBase("end"));
        //     instructions[instructions.length - 1].source =
        //       endInstruction?.source;
        //   }
        //   break;
        // }
        case "return":
          throw new CompilerError("Not implemented");
        default:
          // if (block === this.end && block.parents.length <= 1) break;
          instructions.push(new InstructionBase("end"));
          instructions[instructions.length - 1].source = endInstruction?.source;
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

  canonicalizeBreakIfs(c: ICompilerContext) {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;
      if (
        consequent.type === "backward" ||
        alternate.block.instructions.length > 0
      )
        return;
      const conditionInst = block.conditionInstruction();

      // TODO: just add a the "equals 0" instruction
      // and let the optimizer merge it with other operations
      if (conditionInst) {
        if (!conditionInst.isInvertible()) return;
        conditionInst.invert();
      } else {
        const newCondition = new ImmutableId();
        block.instructions.push(
          new BinaryOperationInstruction(
            "equal",
            endInstruction.condition,
            c.registerValue(new LiteralValue(0)),
            newCondition,
          ),
        );
        endInstruction.condition = newCondition;
      }
      endInstruction.alternate = consequent;
      endInstruction.consequent = alternate;
    });
  }

  foldConstantOperations(c: ICompilerContext) {
    traverse(this.start, block => {
      for (let i = 0; i < block.instructions.length; i++) {
        const inst = block.instructions[i];
        if (inst.type !== "binary-operation" && inst.type !== "unary-operation")
          continue;

        if (!inst.constantFold(c)) continue;
        block.instructions.splice(i, 1);
        i--;
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

  optimize(c: ICompilerContext) {
    this.setParents();
    this.mergeBlocks();
    this.canonicalizeBreakIfs(c);
    this.removeCriticalEdges();
    this.foldConstantOperations(c);
    this.removeConstantBreakIfs(c);
    this.skipBlocks();

    // TODO: fix updating of block parents during
    // the previous optimizations
    this.setParents();
    console.log(dominators(this.start));
    console.log(dominanceFrontier(this.start, dominators(this.start)));
  }
}

export function traverse(block: Block, action: (block: Block) => void) {
  function _traverse(block: Block) {
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
    console.log("df", x);
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
