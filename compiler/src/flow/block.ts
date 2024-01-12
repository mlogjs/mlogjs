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
  constructor(
    public instructions: TBlockInstruction[],
    public endInstruction?: TBlockEndInstruction,
  ) {}

  get children(): Block[] {
    return this.edges.map(edge => edge.block);
  }

  get edges(): TEdge[] {
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
    for (let i = this.instructions.length - 1; i >= 0; i--) {
      const inst = this.instructions[i];
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
    this.instructions.forEach(instruction => {
      if (instruction === conditionInst) return;
      inst.push(...instruction.toMlog(c));
    });
    return inst;
  }
}
