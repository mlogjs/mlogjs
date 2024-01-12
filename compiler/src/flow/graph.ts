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
import { BreakInstruction } from "./instructions";

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
      const { parents } = block;

      if (
        !parents
          .filter(parent => {
            const edge = parent.edges.find(edge => edge.block === block);
            return edge?.type === "forward";
          })
          .every(parent => visited.has(parent))
      ) {
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
          if (block === this.end && block.parents.length <= 1) break;
          instructions.push(new InstructionBase("end"));
          instructions[instructions.length - 1].source = endInstruction?.source;
      }

      // there are at most two children
      // and because of how break-if is implemented
      // having the alternate branch before the consequent branch
      // reduces the amount of instructions needed
      for (let i = block.edges.length - 1; i >= 0; i--) {
        const edge = block.edges[i];
        if (edge.type === "backward") continue;
        // for (let i = 0; i < block.children.length; i++) {
        flatten(edge.block);
      }
    };

    flatten(this.start);

    return instructions;
  }

  canonicalizeBreakIfs() {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;
      if (alternate.block.instructions.length > 0) return;
      const conditionInst = block.conditionInstruction();

      if (!conditionInst?.isInvertible()) return;

      conditionInst.invert();
      endInstruction.alternate = consequent;
      endInstruction.consequent = alternate;
    });
  }

  optimize(c: ICompilerContext) {
    this.setParents();
    this.mergeBlocks();
    this.canonicalizeBreakIfs();
    this.removeCriticalEdges();
    this.skipBlocks();

    // TODO: fix updating of block parents during
    // the previous optimizations
    this.setParents();
  }
}

function traverse(block: Block, action: (block: Block) => void) {
  function _traverse(block: Block) {
    action(block);
    for (const edge of block.edges) {
      if (edge.type === "backward") continue;
      _traverse(edge.block);
    }
  }

  _traverse(block);
}
