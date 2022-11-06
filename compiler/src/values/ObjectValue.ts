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
    intialData?: IObjectValueData
  ): ObjectValue {
    const data: IObjectValueData = {
      ...intialData,
      length: new LiteralValue(items.length),
    };
    items.forEach((item, i) => {
      if (item) data[i] = item;
    });
    return new ObjectValue(data);
  }

  typeof(scope: IScope, out?: TEOutput): TValueInstructions {
    const { $typeof } = this.data;
    if ($typeof) return $typeof.call(scope, [], out);
    return [new LiteralValue("object"), []];
  }

  get(scope: IScope, key: LiteralValue, out?: TEOutput): TValueInstructions {
    // avoids naming collisions with keys like
    // constructor or toString
    if (Object.prototype.hasOwnProperty.call(this.data, key.data)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const member = this.data[key.data]!;
      return [member, []];
    }
    const { $get } = this.data;
    if (!$get) throw new CompilerError("Cannot get undefined member.");
    return $get.call(scope, [key], out);
  }

  eval(scope: IScope, out?: TEOutput): TValueInstructions {
    const { $eval } = this.data;
    if (!$eval) return [this, []];
    return $eval.call(scope, [], out);
  }
  call(
    scope: IScope,
    args: IValue[],
    out?: TEOutput
  ): TValueInstructions<IValue | null> {
    const { $call } = this.data;
    if (!$call) return super.call(scope, args, out);
    return $call.call(scope, args, out);
  }
}

for (const op of leftRightOperators) {
  ObjectValue.prototype[op] = function (
    this: ObjectValue,
    scope: IScope,
    value: IValue,
    out?: TEOutput
  ) {
    const $ = this.data[`$${op}`];
    if (!$) return VoidValue.prototype[op].apply(this, [scope, value, out]);
    return $.call(scope, [value], out);
  };
}

for (const op of unaryOperators) {
  if (op === "typeof") continue;
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
    out?: TEOutput
  ) {
    const $ = this.data[`$${op}`];
    if (!$) return VoidValue.prototype[op].apply(this, [scope, prefix, out]);
    return $.call(scope, [new LiteralValue(+prefix)], out);
  };
}
