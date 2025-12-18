import { NativeInstruction } from "../../flow";
import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class Format extends MacroFunction {
  constructor() {
    super((c, cursor, loc, value) => {
      cursor.addInstruction(
        new NativeInstruction(["format", value], [value], [], loc),
      );
      return c.nullId;
    });
  }
}
