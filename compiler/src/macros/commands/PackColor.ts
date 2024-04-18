import { CompilerError } from "../../CompilerError";
import { ImmutableId, NativeInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class PackColor extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      if (args.length !== 4) {
        throw new CompilerError(
          `Expected 4 arguments, received ${args.length}`,
        );
      }

      const out = new ImmutableId();
      cursor.addInstruction(
        new NativeInstruction(["packcolor", out, ...args], args, [out], loc),
      );
      return out;
    });
  }
}
