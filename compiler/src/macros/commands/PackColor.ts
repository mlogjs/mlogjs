import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class PackColor extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      if (args.length !== 4) {
        throw new CompilerError(
          `Expected 4 arguments, received ${args.length}`,
        );
      }

      const out = c.createImmutableId();
      cursor.addInstruction(
        new NativeInstruction(["packcolor", out, ...args], args, [out], loc),
      );
      return out;
    });
  }
}
