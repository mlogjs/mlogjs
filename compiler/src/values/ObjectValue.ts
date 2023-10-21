import { CompilerError } from "../CompilerError";
import { MacroFunction } from "../macros";
import {
  leftRightOperators,
  unaryOperators,
  updateOperators,
} from "../operators";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TOperatorMacroMap,
  TValueInstructions,
} from "../types";
import { LiteralValue } from "./LiteralValue";
import { VoidValue } from "./VoidValue";

export interface IObjectValueData extends TOperatorMacroMap {
  [k: string]: IValue | undefined;
  $get?: MacroFunction<IValue>;
  $eval?: MacroFunction<IValue>;
}
export class ObjectValue extends VoidValue {
  mutability = EMutability.constant;
  macro = true;
  data: IObjectValueData;

  constructor(data: IObjectValueData = {}) {
    super();
    this.data = data;
  }

  static fromArray(
    items: IObjectValueData[keyof IObjectValueData][],
    initialData?: IObjectValueData,
  ): ObjectValue {
    const data: IObjectValueData = {
      ...initialData,
      length: new LiteralValue(items.length),
    };
    items.forEach((item, i) => {
      if (item) data[i] = item;
    });
    return new ObjectValue(data);
  }

  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions {
    if (key instanceof LiteralValue && (key.isNumber() || key.isString())) {
      // avoids naming collisions with keys like
      // constructor or toString
      if (Object.prototype.hasOwnProperty.call(this.data, key.data)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return [this.data[key.data]!, []];
      }
    }

    const { $get } = this.data;
    if (!$get)
      throw new CompilerError(
        `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
      );
    return $get.call(scope, [key], out);
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (prop instanceof LiteralValue && (prop.isNumber() || prop.isString())) {
      const hasMember = Object.prototype.hasOwnProperty.call(
        this.data,
        prop.data,
      );
      return hasMember;
    }

    return false;
  }

  eval(scope: IScope, out?: TEOutput): TValueInstructions {
    const { $eval } = this.data;
    if (!$eval) return [this, []];
    return $eval.call(scope, [], out);
  }
  call(
    scope: IScope,
    args: IValue[],
    out?: TEOutput,
  ): TValueInstructions<IValue | null> {
    const { $call } = this.data;
    if (!$call) return super.call(scope, args, out);
    return $call.call(scope, args, out);
  }

  "??"(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    const $ = this.data["$??"];
    if ($) return $.call(scope, [other], out);
    return [this, []];
  }

  debugString(): string {
    if (this.name) return `ObjectValue("${this.name}")`;
    return "ObjectValue";
  }

  toMlogString(): string {
    return '"[macro ObjectValue]"';
  }
}

for (const op of leftRightOperators) {
  if (op === "??") continue;
  ObjectValue.prototype[op] = function (
    this: ObjectValue,
    scope: IScope,
    value: IValue,
    out?: TEOutput,
  ) {
    const $ = this.data[`$${op}`];
    if (!$) return VoidValue.prototype[op].apply(this, [scope, value, out]);
    return $.call(scope, [value], out);
  };
}

for (const op of unaryOperators) {
  ObjectValue.prototype[op] = function (scope: IScope, out?: TEOutput) {
    const $ = this.data[`$${op}`];
    if (!$) return VoidValue.prototype[op].apply(this, [scope, out]);
    return $.call(scope, [], out);
  };
}

for (const op of updateOperators) {
  ObjectValue.prototype[op] = function (
    this: ObjectValue,
    scope: IScope,
    prefix: boolean,
    out?: TEOutput,
  ) {
    const $ = this.data[`$${op}`];
    if (!$) return VoidValue.prototype[op].apply(this, [scope, prefix, out]);
    return $.call(scope, [new LiteralValue(+prefix)], out);
  };
}
