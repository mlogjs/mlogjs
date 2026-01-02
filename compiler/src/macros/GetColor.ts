import { CompilerError } from "../CompilerError";
import { EMutability } from "../types";
import { LiteralValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

export class GetColor extends MacroFunction {
  constructor() {
    super((c, cursor, loc, colorId) => {
      const color = c.getValue(colorId);
      if (!(color instanceof LiteralValue) || !color.isString())
        throw new CompilerError(
          "The color parameter must be a string literal.",
        );

      return c.registerValue(
        new StoreValue(`%${color.data}`, EMutability.constant),
      );
    });
  }
}
