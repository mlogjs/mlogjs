import { CompilerError } from "../CompilerError";
import { IScope, IValue } from "../types";
import { LiteralValue, SenseableValue } from "../values";
import { ValueOwner } from "../values/ValueOwner";
import { MacroFunction } from "./Function";

export class GetGlobal extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (name: IValue) => {
      if (!(name instanceof LiteralValue) || typeof name.data !== "string")
        throw new CompilerError("The name parameter must be a string literal.");

      const owner = new ValueOwner({
        scope,
        name: name.data,
        value: new SenseableValue(scope),
      });
      return [owner.value, []];
    });
  }
}
