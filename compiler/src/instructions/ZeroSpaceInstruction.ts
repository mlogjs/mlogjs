import { formatInstructionArgs } from "../utils";
import { InstructionBase } from "./InstructionBase";

export class ZeroSpaceInstruction extends InstructionBase {
  toString() {
    return formatInstructionArgs(this.args).join("");
  }
}
