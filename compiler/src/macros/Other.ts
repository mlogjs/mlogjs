import { LiteralValue } from "../values";
import { IScope, IValue } from "../types";
import { MacroFunction } from "./Function";
import { CompilerError } from "../CompilerError";

export class Concat extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (...values: IValue[]) => {
      for (const value of values)
        if (!(value instanceof LiteralValue))
          throw new CompilerError(
            "Concat arguments must all be literal values."
          );
      return [
        new LiteralValue(
          scope,
          values.map(v => (v as LiteralValue).data).join("")
        ),
        [],
      ];
    });
  }
}
