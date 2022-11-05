import { camelToDashCase } from "../utils";
import { MacroFunction } from ".";
import { EMutability } from "../types";
import {
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { CompilerError } from "../CompilerError";

const dynamicVars = ["time", "tick"];

interface NamespaceMacroOptions {
  changeCasing?: boolean;
}
export class NamespaceMacro extends ObjectValue {
  changeCasing: boolean;
  constructor({ changeCasing = false }: NamespaceMacroOptions = {}) {
    super({
      $get: new MacroFunction((scope, out, prop) => {
        if (!(prop instanceof LiteralValue) || !prop.isString())
          throw new CompilerError(
            "Cannot use dynamic properties on namespace macros"
          );
        const symbolName = this.changeCasing
          ? camelToDashCase(prop.data)
          : prop.data;

        const mutability = dynamicVars.includes(symbolName)
          ? EMutability.readonly
          : EMutability.constant;

        const result = new StoreValue(`@${symbolName}`, mutability);

        return [result, []];
      }),
    });
    this.changeCasing = changeCasing;
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor() {
    super();
    Object.assign<IObjectValueData, IObjectValueData>(this.data, {
      unit: new SenseableValue("@unit"),
      this: new SenseableValue("@this"),
    });
  }
}
