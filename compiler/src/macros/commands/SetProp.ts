import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class SetProp extends MacroFunction<null> {
  constructor() {
    super((scope, out, property, target, value) => {
      if (!property) throw new CompilerError("Missing argument: property");
      if (!target) throw new CompilerError("Missing argument: target");
      if (!value) throw new CompilerError("Missing argument: value");

      return [null, [new InstructionBase("setprop", property, target, value)]];
    });
  }
}
