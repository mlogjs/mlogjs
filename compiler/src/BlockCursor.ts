import { CompilerError } from "./CompilerError";
import {
  Block,
  BreakInstruction,
  InstructionNode,
  TBlockEndInstruction,
  TBlockInstruction,
} from "./flow";
import { Location, es } from "./types";

export interface IBlockCursor {
  currentBlock: Block;
  position: InstructionNode | undefined;

  /**
   * Adds an instruction after the instruction currently pointed at by the
   * cursor
   */
  addInstruction(instruction: TBlockInstruction): void;
  /** Removes the instruction currently pointed at by the cursor */
  removeInstruction(): void;

  /** Attempts to connect a block to the current block pointed at by this cursor. */
  connectBlock(block: Block, node: es.Node): void;

  setEndInstruction(instruction: TBlockEndInstruction): void;

  discardFollowing(): void;
}

export type CursorMode = "create" | "edit";

export class BlockCursor implements IBlockCursor {
  private _currentBlock: Block;
  position: InstructionNode | undefined;

  constructor(
    public mode: CursorMode,
    currentBlock: Block,
  ) {
    this._currentBlock = currentBlock;
  }

  get currentBlock(): Block {
    return this._currentBlock;
  }

  set currentBlock(block: Block) {
    this._currentBlock = block;
    this.position = undefined;
  }

  addInstruction(instruction: TBlockInstruction) {
    if (this.mode === "create" && this.currentBlock.endInstruction) return;

    if (this.position === undefined) {
      this.currentBlock.instructions.add(instruction);
      return;
    }

    this.currentBlock.instructions.insertAfter(this.position, instruction);
    this.position = this.position.next;
  }

  removeInstruction() {
    if (this.position === undefined) {
      this.currentBlock.instructions.removeLast();
      return;
    }

    const { previous } = this.position;
    this.currentBlock.instructions.remove(this.position);
    this.position = previous;
  }

  connectBlock(block: Block, loc: Location) {
    if (block === this.currentBlock) return;
    this.setEndInstruction(new BreakInstruction(block, loc));
    this.currentBlock = block;
  }

  setEndInstruction(instruction: TBlockEndInstruction) {
    if (this.mode === "create" && this.currentBlock.endInstruction) return;
    this.currentBlock.endInstruction = instruction;
  }

  discardFollowing(): void {
    if (!this.position)
      throw new CompilerError(
        "Attempted to discard instructions without a position",
      );
    this.position.next = undefined;
    this.currentBlock.instructions.tail = this.position;
  }
}
