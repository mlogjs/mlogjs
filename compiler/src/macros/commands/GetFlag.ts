import { NativeInstruction } from "../../flow";
import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class GetFlag extends MacroFunction {
  constructor() {
    super((c, cursor, loc, flag) => {
      const out = c.createImmutableId();
      cursor.addInstruction(
        new NativeInstruction(["getflag", out, flag], [flag], [out], loc),
      );

      return out;
    });
  }
}
