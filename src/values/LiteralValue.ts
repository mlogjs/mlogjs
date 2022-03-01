import {
  IScope,
  IBindableValue,
  TLiteral,
  TValueInstructions,
  IValue,
} from "../types";
import { BaseValue } from ".";
import { BinaryOperator, LogicalOperator, UnaryOperator } from "../operators";

const literalMethods = {
  length: function (this: LiteralValue, scope: IScope) {
    if (typeof this.data !== "string")
      throw new Error("Length method only works on string literal values.");
    return new LiteralValue(scope, this.data.length);
  },
};

export class LiteralValue extends BaseValue implements IBindableValue {
  data: TLiteral;
  constant = true;
  constructor(scope: IScope, data: TLiteral) {
    super(scope);
    this.data = data;
  }
  eval(scope: IScope): TValueInstructions {
    return [this, []];
  }
  toString() {
    return JSON.stringify(this.data);
  }
  get(scope: IScope, name: IValue): TValueInstructions {
    if (!(name instanceof LiteralValue && typeof name.data === "string"))
      return super.get(scope, name);
    const method = literalMethods[name.data];
    if (!method)
      throw new Error(`Method ${name.data} does not exist on literal values.`);
    return [method.apply(this, [scope]), []];
  }
  get num() {
    if (this.data === null) return 0;
    if (typeof this.data === "string") return 1;
    return this.data;
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "literal"), []];
  }
}

type TOperationFn = (a: number, b?: number) => number;

const operatorMap: { [k in BinaryOperator | LogicalOperator]?: TOperationFn } =
  {
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

for (const key in operatorMap) {
  const fn = operatorMap[key] as TOperationFn;
  LiteralValue.prototype[key] = function (
    this: LiteralValue,
    scope: IScope,
    value: LiteralValue
  ): TValueInstructions {
    if (!(value instanceof LiteralValue)) {
      return BaseValue.prototype[key].apply(this, [scope, value]);
    }
    return [new LiteralValue(scope, fn(this.num, value.num)), []];
  };
}

const unaryOperatorMap: { [k in UnaryOperator]?: TOperationFn } = {
  "!": v => +!v,
  "~": v => ~v,
  "u-": v => -v,
} as const;

for (const key in unaryOperatorMap) {
  LiteralValue.prototype[key] = function (
    this: LiteralValue,
    scope: IScope
  ): TValueInstructions {
    const fn = unaryOperatorMap[key] as TOperationFn;
    return [new LiteralValue(scope, fn(this.num)), []];
  };
}
