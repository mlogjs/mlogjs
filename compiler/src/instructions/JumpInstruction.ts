import { IValue, TLineRef } from "../types";
import { LiteralValue } from "../values";
import { JumpOutValue } from "../values/JumpOutValue";
import { InstructionBase } from "./InstructionBase";

export enum EJumpKind {
  Equal = "equal",
  NotEqual = "notEqual",
  LessThan = "lessThan",
  LessThanEq = "lessThanEq",
  GreaterThan = "greaterThan",
  GreaterThanEq = "greaterThanEq",
  StrictEqual = "strictEqual",
  Always = "always",
}

export class JumpInstruction extends InstructionBase {
  constructor(
    public address: TLineRef,
    kind: EJumpKind,
    left: IValue | null = null,
    right: IValue | null = null,
  ) {
    super("jump", address, kind, left, right);
  }

  /**
   * Works with the `JumpOutValue` class to determine wether a jump should be
   * added if the expression wasn't jump compressed.
   */
  static or(test: IValue, out: JumpOutValue) {
    if (test === out) return [];
    return [
      new JumpInstruction(
        out.address,
        out.whenTrue ? EJumpKind.NotEqual : EJumpKind.Equal,
        test,
        new LiteralValue(0),
      ),
    ];
  }
}
