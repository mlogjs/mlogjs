import { CompilerError } from "../CompilerError";
import { IScope, IValue } from "../types";
import { LiteralValue } from "../values";
import { ValueOwner } from "../values/ValueOwner";
import { MacroFunction } from "./Function";
import { createTemp } from "../utils";

export class RawValueMacro extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (name: IValue) => {
      if (!(name instanceof LiteralValue) || typeof name.data !== "string")
        throw new CompilerError(
          "The name of the building must be a string literal."
        );

      const owner = new ValueOwner({
        scope,
        name: name.data,
        value: createTemp(scope),
      });
      return [owner.value, []];
    });
  }
}
