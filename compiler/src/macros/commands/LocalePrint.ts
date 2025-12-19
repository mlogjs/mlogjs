import { NativeInstruction } from "../../flow";
import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class LocalePrint extends MacroFunction {
  constructor() {
    super((c, cursor, loc, name) => {
      // TODO: make sure name is specificed, otherwise we'll
      // get an unintuitive error during optimization
      cursor.addInstruction(
        new NativeInstruction(["localeprint", name], [name], [], loc),
      );
      return c.nullId;
    });
  }
}
