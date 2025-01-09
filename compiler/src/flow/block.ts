import { ICompilerContext } from "../CompilerContext";
import { IInstruction } from "../types";
import { TBlockEndInstruction, TBlockInstruction } from "./instructions";

export interface IForwardEdge {
  type: "forward";
  block: Block;
}

export interface IBackwardEdge {
  type: "backward";
  block: Block;
}

export type TEdge = IForwardEdge | IBackwardEdge;

export class Block {
  parents: Block[] = [];

  instructions = new InstructionList();
  constructor(public endInstruction?: TBlockEndInstruction) {}

  get forwardParents(): Block[] {
    return this.parents.filter(parent =>
      parent.childEdges.some(
        edge => edge.block === this && edge.type === "forward",
      ),
    );
  }

  get children(): Block[] {
    return this.childEdges.map(edge => edge.block);
  }

  get childEdges(): TEdge[] {
    if (!this.endInstruction) return [];
    switch (this.endInstruction.type) {
      case "break":
        return [this.endInstruction.target];
      case "break-if":
        return [this.endInstruction.consequent, this.endInstruction.alternate];
      default:
        return [];
    }
  }

  addParent(block: Block) {
    if (this.parents.includes(block)) return;
    this.parents.push(block);
  }

  removeParent(block: Block) {
    const index = this.parents.indexOf(block);
    if (index === -1) return;
    this.parents.splice(index, 1);
  }

  conditionInstruction() {
    if (this.endInstruction?.type !== "break-if") return;
    const { condition } = this.endInstruction;

    for (const inst of this.instructions.inReverse()) {
      if (
        inst.type === "binary-operation" &&
        inst.out === condition &&
        inst.isJumpMergeable()
      ) {
        return inst;
      }
    }
  }

  toForward(): IForwardEdge {
    return {
      type: "forward",
      block: this,
    };
  }

  toBackward(): IBackwardEdge {
    return {
      type: "backward",
      block: this,
    };
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const inst: IInstruction[] = [];

    const conditionInst = this.conditionInstruction();

    for (const instruction of this.instructions) {
      if (instruction === conditionInst) continue;
      inst.push(...instruction.toMlog(c));
    }
    return inst;
  }
}

export class InstructionNode {
  previous?: InstructionNode = undefined;
  next?: InstructionNode = undefined;

  constructor(public instruction: TBlockInstruction) {}
}

export class InstructionList {
  length = 0;
  head?: InstructionNode;
  tail?: InstructionNode;

  get isEmpty() {
    return this.length === 0;
  }

  add(instruction: TBlockInstruction) {
    const node = new InstructionNode(instruction);
    this.length++;
    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }

    const tail = this.tail!;
    tail.next = node;

    node.previous = tail;
    this.tail = node;
  }

  insertAfter(before: InstructionNode, instruction: TBlockInstruction) {
    this.length++;
    const after = before.next;
    const middle = new InstructionNode(instruction);
    middle.previous = before;
    middle.next = after;

    before.next = middle;
    if (after) {
      after.previous = middle;
    }

    if (this.tail === before) {
      this.tail = middle;
    }
  }

  remove(node: InstructionNode) {
    this.length--;
    if (node === this.head && node === this.tail) {
      this.head = undefined;
      this.tail = undefined;
      return;
    }

    if (node === this.head) {
      this.head = node.next;
      this.head!.previous = undefined;
      return;
    }

    if (node === this.tail) {
      this.tail = node.previous;
      this.tail!.next = undefined;
      return;
    }

    if (node.previous) node.previous.next = node.next;
    if (node.next) node.next.previous = node.previous;
  }

  removeLast() {
    if (!this.tail) return;
    this.remove(this.tail);
  }

  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      yield current.instruction;
      current = current.next;
    }
  }

  *inReverse() {
    let current = this.tail;
    while (current) {
      yield current.instruction;
      current = current.previous;
    }
  }

  *nodes() {
    let current = this.head;
    while (current) {
      yield current;
      current = current.next;
    }
  }

  removeAllAfter(node: InstructionNode) {
    // needs to update the length
    // TODO: is knowing the exact length necessary?
    // we may only need to know if the list is empty or not
    let count = 0;
    let current = node;
    while (current.next) {
      current = current.next;
      count++;
    }

    this.length -= count;
    node.next = undefined;
    this.tail = node;
  }
}
