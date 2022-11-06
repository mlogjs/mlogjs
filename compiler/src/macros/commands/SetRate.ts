import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class SetRate extends MacroFunction<null> {
  constructor() {
    super((scope, out, ipt) => [null, [new InstructionBase("setrate", ipt)]]);
  }
}
