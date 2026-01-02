import { IScope, TEOutput } from "../types";
import { MacroFunction } from "./Function";

export class Unchecked extends MacroFunction {
  constructor() {
    super((c, cursor, loc, expression) => {
      return expression;
    });
  }

  preCall(scope: IScope): readonly TEOutput[] | undefined {
    scope.checkIndexes = false;
    return undefined;
  }

  postCall(scope: IScope): void {
    scope.checkIndexes = true;
  }
}
