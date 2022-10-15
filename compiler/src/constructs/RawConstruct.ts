import { IInstruction } from "../types";
import { IConstruct } from "./types";

/**
 * Used to wrap instructions, must
 */
export class RawConstruct implements IConstruct {
  constructor(public instruction: IInstruction) {}

  expand(): IInstruction[] {
    return [this.instruction];
  }
}
