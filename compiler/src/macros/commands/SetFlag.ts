import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class SetFlag extends MacroFunction<null> {
  constructor() {
    super((scope, out, flag, value) => {
      if (!flag) throw new CompilerError("Missing flag argument");
      if (!value) throw new CompilerError("Missing flag value");

      return [null, [new InstructionBase("setflag", flag, value)]];
    });
  }
}
