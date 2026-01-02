import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class SetFlag extends MacroFunction {
  constructor() {
    super((c, cursor, loc, flag, value) => {
      if (!flag) throw new CompilerError("Missing flag argument");
      if (!value) throw new CompilerError("Missing flag value");

      cursor.addInstruction(
        new NativeInstruction(["setflag", flag, value], [flag, value], [], loc),
      );
      return c.nullId;
    });
  }
}
