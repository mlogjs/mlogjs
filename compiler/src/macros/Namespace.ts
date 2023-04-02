import { camelToDashCase } from "../utils";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import {
  IObjectValueData,
  LiteralValue,
  ObjectValue,
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
    super();
    this.changeCasing = changeCasing;
  }

  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions<IValue> {
    if (super.hasProperty(scope, key)) return super.get(scope, key, out);

    if (!(key instanceof LiteralValue) || !key.isString())
      throw new CompilerError(
        "Cannot use dynamic properties on namespace macros"
      );
    const symbolName = this.changeCasing ? camelToDashCase(key.data) : key.data;

    const mutability = dynamicVars.includes(symbolName)
      ? EMutability.readonly
      : EMutability.constant;

    const result = new StoreValue(`@${symbolName}`, mutability);

    return [result, []];
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    return prop instanceof LiteralValue && prop.isString();
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor() {
    super();
    Object.assign<IObjectValueData, IObjectValueData>(this.data, {
      unit: new StoreValue("@unit", EMutability.constant),
      this: new StoreValue("@this", EMutability.constant),
    });
  }
}
