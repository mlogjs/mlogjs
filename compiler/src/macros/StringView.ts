import { InstructionBase } from "../instructions";
import { IScope, IValue, TEOutput, TValueInstructions } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { MacroFunction } from "./Function";

class StringView extends ObjectValue {
  constructor(public string: IValue) {
    super();
  }

  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions<IValue> {
    if (super.hasProperty(scope, key)) return super.get(scope, key, out);

    if (key instanceof LiteralValue) {
      if (key.data === "length") {
        return this.string.get(scope, key, out);
      }

      if (!key.isNumber())
        throw new CompilerError(
          `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
        );

      if (this.string instanceof LiteralValue && this.string.isString()) {
        const char = this.string.data.charCodeAt(key.data);

        return [new LiteralValue(char), []];
      }
    }

    const outValue = StoreValue.from(scope, out);

    return [
      outValue,
      [new InstructionBase("read", outValue, this.string, key)],
    ];
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (
      (prop instanceof LiteralValue && prop.isNumber()) ||
      prop instanceof StoreValue
    )
      return true;
    return super.hasProperty(scope, prop);
  }

  debugString(): string {
    return `StringView(${this.string.debugString()})`;
  }

  toMlogString() {
    return '"[macro StringView]"';
  }
}

export class StringViewBuilder extends MacroFunction {
  constructor() {
    super((scope, out, string) => {
      return [new StringView(string), []];
    });
  }
}
