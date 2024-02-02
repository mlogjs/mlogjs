import { CompilerError } from "../CompilerError";
import { EMutability } from "../types";
import { LiteralValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

export class GetColor extends MacroFunction {
  constructor() {
    super((scope, out, color) => {
      if (!(color instanceof LiteralValue) || !color.isString())
        throw new CompilerError(
          "The color parameter must be a string literal.",
        );

      return [new StoreValue(`%${color.data}`, EMutability.constant), []];
    });
  }
}
