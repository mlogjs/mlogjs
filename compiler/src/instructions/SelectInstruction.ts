import { IValue } from "../types";
import { InstructionBase } from "./InstructionBase";
import { EJumpKind } from "./JumpInstruction";

export class SelectInstruction extends InstructionBase {
  constructor(
    result: IValue,
    kind: EJumpKind,
    x: IValue | null = null,
    y: IValue | null = null,
    whenTrue: IValue | null = null,
    whenFalse: IValue | null = null,
  ) {
    super("select", result, kind, x, y, whenTrue, whenFalse);
  }
}
