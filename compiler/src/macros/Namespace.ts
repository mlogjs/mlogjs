import { assign, camelToDashCase } from "../utils";
import { MacroFunction } from ".";
import { EMutability, IScope } from "../types";
import {
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";

const dynamicVars = ["time", "tick"];

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
            "Cannot use dynamic properties on namespace macros"
          );
        const symbolName = this.changeCasing
          ? camelToDashCase(prop.data)
          : prop.data;

        const mutability = dynamicVars.includes(symbolName)
          ? EMutability.readonly
          : EMutability.constant;

        const owner = new ValueOwner({
          scope,
          value: assign(new StoreValue(scope), {
            mutability,
          }),
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
    Object.assign<IObjectValueData, IObjectValueData>(this.data, {
      unit: new ValueOwner({
        scope,
        name: "@unit",
        value: new SenseableValue(scope),
      }).value,
      this: new ValueOwner({
        scope,
        name: "@this",
        value: new SenseableValue(scope),
      }).value,
    });
  }
}
