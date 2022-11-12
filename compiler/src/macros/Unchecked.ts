import { EMutability, IScope, IValue, TEOutput } from "../types";
import { SenseableValue } from "../values";
import { MacroFunction } from "./Function";

export class Unchecked extends MacroFunction {
  constructor() {
    super((scope, out, expression) => [expression, []]);
  }

  preCall(scope: IScope, out?: TEOutput): readonly IValue[] | undefined {
    scope.checkIndexes = false;
    if (out) return [SenseableValue.out(scope, out, EMutability.mutable)];
  }

  postCall(scope: IScope): void {
    scope.checkIndexes = true;
  }
}
