import { InstructionBase } from ".";
import { IValue } from "../types";

export class SetInstruction extends InstructionBase {
  constructor(store: IValue, value: IValue) {
    super("set", store, value);
  }

  get hidden(): boolean {
    return this._hidden || !(this.args[1] as IValue).owner;
  }
}
