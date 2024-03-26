import { camelToDashCase } from "../utils";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";

const dynamicVars = [
  "unit",
  "tick",
  "time",
  "second",
  "minute",
  "waveNumber",
  "waveTime",
];

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
        "Cannot use dynamic properties on namespace macros",
      );
    const symbolName = this.changeCasing ? camelToDashCase(key.data) : key.data;

    if (dynamicVars.includes(symbolName)) {
      return [
        new StoreValue(`@${symbolName}`, EMutability.readonly, {
          volatile: true,
        }),
        [],
      ];
    }

    return [new StoreValue(`@${symbolName}`, EMutability.constant), []];
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    return prop instanceof LiteralValue && prop.isString();
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor() {
    super();
  }
}
