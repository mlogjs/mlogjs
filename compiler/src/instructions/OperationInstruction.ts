import { InstructionBase } from ".";
import { IValue } from "../types";

export class OperationInstruction extends InstructionBase {
  constructor(kind: string, temp: IValue, left: IValue, right: IValue | null) {
    super("op", kind, temp, left, right);
  }
}
