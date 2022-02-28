import { IScope, IValue } from "../types";
import { LiteralValue, StoreValue, TempValue } from "../values";
import { MacroFunction } from "./Function";

export class StoreFactory extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (value: IValue) => {
      if (value instanceof LiteralValue && typeof value.data === "string")
        return [new StoreValue(scope, value.data), []];
      throw new Error(
        "Cannot create store value with name that is not a literal string"
      );
    });
  }
}

export class TempFactory extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, () => [new TempValue(scope), []]);
  }
}
