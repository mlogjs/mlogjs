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
        "Length method only works on string literal values.",
      );
    return new LiteralValue(this.data.length);
  },
};

export class LiteralValue<T extends TLiteral | null = TLiteral>
  extends BaseValue
  implements IBindableValue<T>
{
  name: string;
  data: T;
  mutability = EMutability.constant;
  constructor(data: T) {
    super();
    this.data = data;
    this.name = JSON.stringify(this.data);
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  toMlogString() {
    const { data } = this;
    if (typeof data !== "string") return JSON.stringify(data);

    // this special handling is required because of
    // how mindustry parses string literals in logic statements

    // replace double quotes by two single quotes before
    // forming the json string
    // (there is no way to escape a " character)
    return JSON.stringify(data.replace(/"/g, "''")).replace(/\\\\/g, "\\"); // "unescape" backslashes
  }
  get(scope: IScope, name: IValue): TValueInstructions {
    if (!(name instanceof LiteralValue && name.isString()))
      return super.get(scope, name);
    const method = literalMethods[name.data];
    if (
      !method ||
      !Object.prototype.hasOwnProperty.call(literalMethods, name.data)
    )
      throw new CompilerError(
        `The member [${name.debugString()}] does not exist on literal values.`,
      );
    return [method.apply(this, [scope]), []];
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (this.isString() && prop instanceof LiteralValue && prop.isString())
      return Object.prototype.hasOwnProperty.call(literalMethods, prop.data);
    return false;
  }

  get num() {
    if (this.data === null) return 0;
    if (typeof this.data === "string") return 1;
    return this.data;
  }

  "??"(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    if (this.data === null) return other.eval(scope, out);
    return [this, []];
  }

  isString(): this is LiteralValue<string> {
    return typeof this.data === "string";
  }

  isNumber(): this is LiteralValue<number> {
    return typeof this.data === "number";
  }

  debugString(): string {
    return this.toMlogString();
  }
}

type TOperationFn = (a: number, b?: number) => number;
type TBinOperationFn = (a: number, b: number) => number;

const operatorMap = {
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
} as const satisfies Record<
  Exclude<BinaryOperator | LogicalOperator, "instanceof" | "in" | "??">,
  TBinOperationFn
>;

for (const k in operatorMap) {
  const key = k as keyof typeof operatorMap;
  const fn = operatorMap[key];
  LiteralValue.prototype[key] = function (
    this: LiteralValue,
    scope: IScope,
    value: LiteralValue,
    out?: TEOutput,
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
    this: LiteralValue,
  ): TValueInstructions {
    const fn = unaryOperatorMap[key as K];
    return [new LiteralValue(fn(this.data as never)), []];
  };
}
