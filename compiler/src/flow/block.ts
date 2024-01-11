import { ICompilerContext } from "../CompilerContext";
import { IInstruction } from "../types";
import { TBlockEndInstruction, TBlockInstruction } from "./instructions";

export class Block {
  parents: Block[] = [];
  constructor(
    public instructions: TBlockInstruction[],
    public endInstruction?: TBlockEndInstruction,
  ) {}

  get children(): Block[] {
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
