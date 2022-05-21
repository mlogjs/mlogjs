import { IBindableValue } from "../types";
import { EJumpKind, JumpInstruction } from "./JumpInstruction";

export class BreakInstruction extends JumpInstruction {
  constructor(address: IBindableValue) {
    super(address, EJumpKind.Always);
  }
}

export class ContinueInstruction extends JumpInstruction {
  constructor(address: IBindableValue) {
    super(address, EJumpKind.Always);
  }
}
