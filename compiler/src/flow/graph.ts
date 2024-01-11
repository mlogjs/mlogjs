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
import { Block } from "./block";
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

      if (consequent.parents.length === 1 && alternate.parents.length === 1) {
        queue.shift();
        continue;
      }

      if (consequent.parents.length > 1) {
        const newBlock = new Block([], new BreakInstruction(consequent));
        newBlock.endInstruction!.source = block.endInstruction.source;
        newBlock.addParent(block);
        consequent.removeParent(block);
        consequent.addParent(newBlock);
        block.endInstruction.consequent = newBlock;
      }

      if (alternate.parents.length > 1) {
        const newBlock = new Block([], new BreakInstruction(alternate));
        newBlock.endInstruction!.source = block.endInstruction.source;

        newBlock.addParent(block);
        alternate.removeParent(block);
        alternate.addParent(newBlock);
        block.endInstruction.alternate = newBlock;
      }
    }
  }

  mergeBlocks() {
    traverse(this.start, block => {
      while (block.endInstruction?.type === "break") {
        const { target } = block.endInstruction;
        if (target.parents.length !== 1) break;
        block.instructions.push(...target.instructions);
        block.endInstruction = target.endInstruction;
        target.children.forEach(child => {
          child.removeParent(target);
          child.addParent(block);
        });
        if (target === this.end) this.end = block;
      }
    });
  }

  skipBlocks() {
    function tryToRedirect(block: Block, oldTarget: Block) {
      let current = oldTarget;

      while (
        current.endInstruction?.type === "break" &&
        current.instructions.length === 0
      ) {
        current = current.endInstruction.target;
      }

      if (current === oldTarget) return;
      const newTarget = current;
      newTarget.addParent(block);
      oldTarget.removeParent(block);
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

    let pending: Block | undefined;

    const flatten = (block: Block, force = false) => {
      if (visited.has(block)) return;
      const { parents } = block;
      if (!force && !parents.every(parent => visited.has(parent))) {
        pending ??= block;
        return;
      }
      visited.add(block);
      if (pending === block) pending = undefined;
      instructions.push(new AddressResolver(addresses.get(block)!));
      // instructions.push(new InstructionBase("blockstart"));
      instructions.push(...block.toMlog(c));
      const { endInstruction } = block;
      switch (endInstruction?.type) {
        case "break":
          instructions.push(
            new JumpInstruction(
              addresses.get(endInstruction.target)!,
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
                addresses.get(consequent)!,
                conditionInst.operator as EJumpKind,
                c.getValue(conditionInst.left),
                c.getValue(conditionInst.right),
              ),
            );
          } else {
            instructions.push(
              new JumpInstruction(
                addresses.get(consequent)!,
                EJumpKind.NotEqual,
                condition,
                new LiteralValue(0),
              ),
            );
          }

          instructions.push(
            new JumpInstruction(addresses.get(alternate)!, EJumpKind.Always),
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
      for (let i = block.children.length - 1; i >= 0; i--) {
        // for (let i = 0; i < block.children.length; i++) {
        const child = block.children[i];
        flatten(child);
      }
    };

    flatten(this.start);

    while (pending) flatten(pending, true);
    return instructions;
  }

  canonicalizeBreakIfs() {
    traverse(this.start, block => {
      const { endInstruction } = block;
      if (endInstruction?.type !== "break-if") return;
      const { alternate, consequent } = endInstruction;
      if (alternate.instructions.length > 0) return;
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
  const visited = new Set<Block>();
  function _traverse(block: Block) {
    if (visited.has(block)) return;
    visited.add(block);
    action(block);
    block.children.forEach(_traverse);
  }

  _traverse(block);
}
