import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { MacroFunction } from "../Function";

export class UnpackColor extends MacroFunction {
  constructor() {
    super((c, cursor, loc, colorId) => {
      const color = c.getValue(colorId);
      if (!color) {
        throw new CompilerError(`Missing argument: color`);
      }

      const outR = c.createImmutableId();
      const outG = c.createImmutableId();
      const outB = c.createImmutableId();
      const outA = c.createImmutableId();

      cursor.addInstruction(
        new NativeInstruction(
          ["unpackcolor", outR, outG, outB, outA, colorId],
          [colorId],
          [outR, outG, outB, outA],
          loc,
        ),
      );

      return c.registerValue(
        new ObjectValue({
          r: outR,
          g: outG,
          b: outB,
          a: outA,
        }),
      );
    });
  }
}
