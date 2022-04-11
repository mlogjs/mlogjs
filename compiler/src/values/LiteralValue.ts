import {
  IScope,
  IBindableValue,
  TLiteral,
  TValueInstructions,
  IValue,
} from "../types";
import { BaseValue } from ".";
import { BinaryOperator, LogicalOperator, UnaryOperator } from "../operators";
import { CompilerError } from "../CompilerError";

const literalMethods: Record<
  string,
  (this: LiteralValue, scope: IScope) => LiteralValue
> = {
  length: function (this: LiteralValue, scope: IScope) {
    if (typeof this.data !== "string")
      throw new CompilerError(
        "Length method only works on string literal values."
      );
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
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  consume(_scope: IScope): TValueInstructions {
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

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "literal"), []];
  }
}

type TOperationFn = (a: number, b?: number) => number;
type TBinOperationFn = (a: number, b: number) => number;

const operatorMap: {
  [k in BinaryOperator | LogicalOperator]?: TBinOperationFn;
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

for (const key in operatorMap) {
  type K = keyof typeof operatorMap;
  const fn = operatorMap[key as K] as TOperationFn;
  LiteralValue.prototype[key as K] = function (
    this: LiteralValue,
    scope: IScope,
    value: LiteralValue
  ): TValueInstructions {
    if (!(value instanceof LiteralValue)) {
      return BaseValue.prototype[key as K].apply(this, [scope, value]);
    }
    return [new LiteralValue(scope, fn(this.num, value.num)), []];
  };
}

const unaryOperatorMap: {
  [k in Exclude<
    UnaryOperator,
    "u+" | "delete" | "typeof" | "void"
  >]: TOperationFn;
} = {
  "!": v => +!v,
  "~": v => ~v,
  "u-": v => -v,
} as const;

for (const key in unaryOperatorMap) {
  type K = keyof typeof unaryOperatorMap;
  LiteralValue.prototype[key as K] = function (
    this: LiteralValue,
    scope: IScope
  ): TValueInstructions {
    const fn = unaryOperatorMap[key as K];
    return [new LiteralValue(scope, fn(this.num)), []];
  };
}
