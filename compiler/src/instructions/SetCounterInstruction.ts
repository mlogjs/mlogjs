import { InstructionBase } from ".";
import { IValue } from "../types";
import { counterName } from "../utils";

export class SetCounterInstruction extends InstructionBase {
  constructor(value: IValue) {
    super("set", counterName, value);
  }
}
