import { EInstIntent, TLineRef } from "../types";
import { EJumpKind, JumpInstruction } from "./JumpInstruction";

export class BreakInstruction extends JumpInstruction {
  intent = EInstIntent.break;

  constructor(address: TLineRef) {
    super(address, EJumpKind.Always);
  }
}

export class ContinueInstruction extends JumpInstruction {
  intent = EInstIntent.continue;

  constructor(address: TLineRef) {
    super(address, EJumpKind.Always);
  }
}
