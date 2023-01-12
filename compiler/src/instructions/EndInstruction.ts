import { EInstIntent } from "../types";
import { InstructionBase } from "./InstructionBase";

export class EndInstruction extends InstructionBase {
  intent = EInstIntent.exit;
  constructor() {
    super("end");
  }
}
