import { InstructionBase } from "../instructions";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { MacroFunction } from "./Function";

export class QueriesMacro extends ObjectValue {
  queriesStore = new StoreValue("@queries", EMutability.readonly);

  constructor() {
    super({
      at: new MacroFunction((scope, out, index) => {
        if (!index) {
          throw new CompilerError("Expected index argument for queries.at()");
        }
        const outValue = StoreValue.from(scope, out);
        return [
          outValue,
          [new InstructionBase("read", outValue, "@queries", index)],
        ];
      }),
    });
  }

  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions<IValue> {
    if (super.hasProperty(scope, key)) return super.get(scope, key, out);

    if (key instanceof LiteralValue && key.isString()) {
      if (key.data === "length") {
        const outValue = StoreValue.from(scope, out);
        return [
          outValue,
          [new InstructionBase("sensor", outValue, "@queries", "@size")],
        ];
      }
      if (key.data === "value") {
        return [this.queriesStore, []];
      }
    }

    if (
      (key instanceof LiteralValue && key.isNumber()) ||
      !(key instanceof LiteralValue)
    ) {
      const outValue = StoreValue.from(scope, out);
      return [
        outValue,
        [new InstructionBase("read", outValue, "@queries", key)],
      ];
    }

    throw new CompilerError(
      `The member [${key.debugString()}] is not present in QueriesView`,
    );
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (
      (prop instanceof LiteralValue &&
        (prop.isNumber() || prop.data === "length" || prop.data === "value")) ||
      !(prop instanceof LiteralValue)
    ) {
      return true;
    }
    return super.hasProperty(scope, prop);
  }

  debugString(): string {
    return "QueriesView";
  }

  toMlogString() {
    return '"[macro QueriesView]"';
  }
}
