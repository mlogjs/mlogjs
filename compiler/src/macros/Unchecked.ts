import { IScope, TEOutput } from "../types";
import { MacroFunction } from "./Function";

export class Unchecked extends MacroFunction {
  constructor() {
    super((scope, out, expression) => [expression, []]);
  }

  preCall(scope: IScope, out?: TEOutput): readonly TEOutput[] | undefined {
    scope.checkIndexes = false;
    if (out) return [out];
  }

  postCall(scope: IScope): void {
    scope.checkIndexes = true;
  }
}
