import { InstructionBase } from "./InstructionBase";

export class ZeroSpaceInstruction extends InstructionBase {
  toString() {
    return this.args.join("");
  }
}
