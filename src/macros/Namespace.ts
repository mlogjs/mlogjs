import { MacroFunction } from ".";
import { IScope } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";

function transformCasing(name: string) {
  return name.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
}

interface NamespaceMacroOptions {
  changeCasing?: boolean;
}
export class NamespaceMacro extends ObjectValue {
  changeCasing: boolean;
  constructor(
    scope: IScope,
    { changeCasing = false }: NamespaceMacroOptions = {}
  ) {
    super(scope, {
      $get: new MacroFunction(scope, prop => {
        if (!(prop instanceof LiteralValue) || typeof prop.data !== "string")
          throw new Error("Cannot use dynamic properties on object macros");
        const symbolName = this.changeCasing
          ? transformCasing(prop.data)
          : prop.data;
        return [new StoreValue(scope, `@${symbolName}`), []];
      }),
    });
    this.changeCasing = changeCasing;
  }
}
