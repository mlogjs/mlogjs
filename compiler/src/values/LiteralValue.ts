import {
  IScope,
  IBindableValue,
  TLiteral,
  TValueInstructions,
  IValue,
  EMutability,
  TEOutput,
} from "../types";
import { BaseValue } from ".";
import { BinaryOperator, LogicalOperator, UnaryOperator } from "../operators";
import { CompilerError } from "../CompilerError";

const literalMethods: Record<
  string,
  (this: LiteralValue<TLiteral | null>, scope: IScope) => LiteralValue
> = {
  length: function (this: LiteralValue<TLiteral | null>) {
    if (!this.isString())
      throw new CompilerError(
        "Length method only works on string literal values."
      );
    return new LiteralValue(this.data.length);
  },
};

export class LiteralValue<T extends TLiteral | null = TLiteral>
  extends BaseValue
  implements IBindableValue<T>
{
  data: T;
  mutability = EMutability.constant;
  constructor(data: T) {
    super();
    this.data = data;
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  toString() {
    return JSON.stringify(this.data);
  }
  get(scope: IScope, name: IValue): TValueInstructions {
    if (!(name instanceof LiteralValue && name.isString()))
      return super.get(scope, name);
    const method = literalMethods[name.data];
    if (!method)
      throw new CompilerError(
        `Method ${name.data} does not exist on literal values.`
      );
    return [method.apply(this, [scope]), []];
  }
  get num() {
    if (this.data === null) return 0;
    if (typeof this.data === "string") return 1;
    return this.data;
  }

  typeof(): TValueInstructions {
    return [new LiteralValue("literal"), []];
  }

  isString(): this is LiteralValue<string> {
    return typeof this.data === "string";
  }

  isNumber(): this is LiteralValue<number> {
    return typeof this.data === "number";
  }
}

type TOperationFn = (a: number, b?: number) => number;
type TBinOperationFn = (a: number, b: number) => number;

const operatorMap: {
  [k in
    | Exclude<BinaryOperator, "instanceof" | "in">
    | Exclude<LogicalOperator, "??">]: TBinOperationFn;
} = {
  "==": (a, b) => +(a == b),
  "===": (a, b) => +(a === b),
  "!=": (a, b) => +(a != b),
  "!==": (a, b) => +(a !== b),
  "<": (a, b) => +(a < b),
  ">": (a, b) => +(a > b),
  "<=": (a, b) => +(a <= b),
  ">=": (a, b) => +(a >= b),
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => a % b,
  "**": (a, b) => a ** b,
  "|": (a, b) => a | b,
  "&": (a, b) => a & b,
  "^": (a, b) => a ^ b,
  ">>": (a, b) => a >> b,
  ">>>": (a, b) => a >> b,
  "<<": (a, b) => a << b,
  "&&": (a, b) => +(a && b),
  "||": (a, b) => +(a || b),
} as const;

for (const k in operatorMap) {
  const key = k as keyof typeof operatorMap;
  const fn = operatorMap[key];
  LiteralValue.prototype[key] = function (
    this: LiteralValue,
    scope: IScope,
    value: LiteralValue,
    out?: TEOutput
  ): TValueInstructions {
    if (key === "&&") {
      if (this.data) return [value, []];
      return [new LiteralValue(0), []];
    }

    if (key === "||") {
      if (!this.data) return [value, []];
      return [new LiteralValue(1), []];
    }

    if (!(value instanceof LiteralValue)) {
      return BaseValue.prototype[key].apply(this, [scope, value, out]);
    }

    return [new LiteralValue(fn(this.data as never, value.data as never)), []];
  };
}

const unaryOperatorMap: {
  [k in Exclude<UnaryOperator, "delete" | "typeof" | "void">]: TOperationFn;
} = {
  "!": v => +!v,
  "~": v => ~v,
  "u-": v => -v,
  "u+": v => +v,
} as const;

for (const key in unaryOperatorMap) {
  type K = keyof typeof unaryOperatorMap;
  LiteralValue.prototype[key as K] = function (
    this: LiteralValue
  ): TValueInstructions {
    const fn = unaryOperatorMap[key as K];
    return [new LiteralValue(fn(this.data as never)), []];
  };
}
