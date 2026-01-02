import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { NativeInstruction } from "../../flow";

export class PrintChar extends MacroFunction {
  constructor() {
    super((c, cursor, loc, character) => {
      cursor.addInstruction(
        new NativeInstruction(["printchar", character], [character], [], loc),
      );
      return c.nullId;
    });
  }
}
