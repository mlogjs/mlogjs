import { CompilerError } from "./CompilerError";
import {
  Block,
  BreakInstruction,
  TBlockEndInstruction,
  TBlockInstruction,
} from "./flow";
import { es } from "./types";

export class HandlerContext {
  entry: Block;
  exit: Block;
  currentBlock: Block;

  constructor(entry: Block, exit: Block) {
    this.entry = entry;
    this.exit = exit;
    this.currentBlock = entry;
  }

  addInstruction(instruction: TBlockInstruction) {
    if (this.currentBlock.endInstruction) return;
    this.currentBlock.instructions.push(instruction);
  }

  connectBlock(block: Block, node: es.Node) {
    if (block === this.currentBlock) return;
    if (this.currentBlock.endInstruction)
      throw new CompilerError(
        "The current block already has an end instruction",
      );
    this.currentBlock.endInstruction = new BreakInstruction(block, node);
    this.currentBlock = block;
  }

  setEndInstruction(instruction: TBlockEndInstruction) {
    if (this.currentBlock.endInstruction) return;
    this.currentBlock.endInstruction = instruction;
  }
}
