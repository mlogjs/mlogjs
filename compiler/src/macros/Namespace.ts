import { camelToDashCase } from "../utils";
import { MacroFunction } from ".";
import { IScope } from "../types";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";

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
          throw new CompilerError(
            "Cannot use dynamic properties on object macros"
          );
        const symbolName = this.changeCasing
          ? camelToDashCase(prop.data)
          : prop.data;

        const owner = new ValueOwner({
          scope,
          value: new StoreValue(scope),
          name: `@${symbolName}`,
        });
        return [owner.value, []];
      }),
    });
    this.changeCasing = changeCasing;
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor(scope: IScope) {
    super(scope);
    const $get = this.data.$get as MacroFunction;
    this.data.$get = new MacroFunction(scope, prop => {
      if (prop instanceof LiteralValue) {
        if (prop.data === "unit") {
          const owner = new ValueOwner({
            scope,
            value: new SenseableValue(scope),
            name: "@unit",
          });
          return [owner.value, []];
        }
        if (prop.data === "this") {
          const owner = new ValueOwner({
            scope,
            value: new SenseableValue(scope),
            name: "@this",
          });
          return [owner.value, []];
        }
      }
      return $get.call(scope, [prop]);
    });
  }
}

export class UCommandsNamespace extends NamespaceMacro {
  constructor(scope: IScope) {
    super(scope);
    this.data.$get = new MacroFunction(scope, prop => {
      if (!(prop instanceof LiteralValue) || typeof prop.data !== "string")
        throw new CompilerError(
          "Cannot use dynamic properties on object macros"
        );
      const symbolName = prop.data[0].toUpperCase() + prop.data.slice(1);
      const owner = new ValueOwner({
        scope,
        name: `@command${symbolName}`,
        value: new StoreValue(scope),
      });
      return [owner.value, []];
    });
  }
}
