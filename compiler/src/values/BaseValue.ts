import {
  AddressResolver,
  EJumpKind,
  JumpInstruction,
  OperationInstruction,
} from "../instructions";
import {
  AssignementOperator,
  BinaryOperator,
  LogicalOperator,
  updateOperators,
} from "../operators";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue, VoidValue, StoreValue, SenseableValue } from ".";
import { pipeInsts } from "../utils";

export class BaseValue extends VoidValue implements IValue {
  "u-"(scope: IScope, out?: TEOutput): TValueInstructions {
    const [that, inst] = this.eval(scope);
    const temp = StoreValue.from(scope, out);
    return [
      temp,
      [
        ...inst,
        new OperationInstruction("sub", temp, new LiteralValue(0), that),
      ],
    ];
  }
  "u+"(scope: IScope, out?: TEOutput): TValueInstructions {
    // TODO: should it return 0 + this ?
    return this.eval(scope, out);
  }

  "!"(scope: IScope, out?: TEOutput): TValueInstructions {
    const [that, inst] = this.eval(scope);
    const temp = StoreValue.from(scope, out);
    const falseLiteral = new LiteralValue(0);
    return [
      temp,
      [...inst, new OperationInstruction("equal", temp, that, falseLiteral)],
    ];
  }

  "~"(scope: IScope, out?: TEOutput): TValueInstructions {
    const [that, inst] = this.eval(scope);
    const temp = StoreValue.from(scope, out);
    return [temp, [...inst, new OperationInstruction("not", temp, that, null)]];
  }

  // requires special handling
  // the handler should give an object value to allow the lazy evaluation
  "??"(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    if (this instanceof LiteralValue) {
      if (this.data === null) return other.eval(scope, out);
      return [this, []];
    }

    const result = SenseableValue.from(scope, out, EMutability.mutable);

    const [left, leftInst] = this.eval(scope, result);
    const [right, rightInst] = other.eval(scope, result);

    const nullLiteral = new LiteralValue(null);
    const endAdress = new LiteralValue(null);

    return [
      result,
      [
        ...leftInst,
        ...result["="](scope, left)[1],
        new JumpInstruction(endAdress, EJumpKind.NotEqual, result, nullLiteral),
        ...rightInst,
        ...result["="](scope, right)[1],
        new AddressResolver(endAdress),
      ],
    ];
  }

  "!=="(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    const [equal, equalInst] = this["==="](scope, other);
    const [result, resultInst] = equal["!"](scope, out);

    return [result, [...equalInst, ...resultInst]];
  }
}

const operatorMap: Record<
  Exclude<BinaryOperator | LogicalOperator, "instanceof" | "in" | "??" | "!==">,
  string
> = {
  "==": "equal",
  "===": "strictEqual",
  "!=": "notEqual",
  "<": "lessThan",
  ">": "greaterThan",
  "<=": "lessThanEq",
  ">=": "greaterThanEq",
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
  "%": "mod",
  "**": "pow",
  "|": "or",
  "&": "and",
  "^": "xor",
  ">>": "shr",
  ">>>": "shr",
  "<<": "shl",
  "&&": "land",
  "||": "or",
} as const;

for (const key in operatorMap) {
  type K = keyof typeof operatorMap;
  const kind = operatorMap[key as K];
  BaseValue.prototype[key as K] = function (
    this: BaseValue,
    scope: IScope,
    value: IValue,
    out?: TEOutput
  ): TValueInstructions {
    const [left, leftInst] = this.eval(scope);
    const [right, rightInst] = value.eval(scope);
    const temp = StoreValue.from(scope, out);
    return [
      temp,
      [
        ...leftInst,
        ...rightInst,
        new OperationInstruction(kind, temp, left, right),
      ],
    ];
  };
}

const assignmentToBinary: Record<
  Exclude<AssignementOperator, "=">,
  BinaryOperator | LogicalOperator
> = {
  "+=": "+",
  "-=": "-",
  "*=": "*",
  "/=": "/",
  "%=": "%",
  "**=": "**",
  "|=": "|",
  "&=": "&",
  "^=": "^",
  ">>=": ">>",
  ">>>=": ">>>",
  "<<=": "<<",
  "&&=": "&&",
  "||=": "||",
  "??=": "??",
} as const;

for (const k in assignmentToBinary) {
  const op = k as keyof typeof assignmentToBinary;
  BaseValue.prototype[op] = function (
    this: IValue,
    scope: IScope,
    value: IValue
  ): TValueInstructions {
    const [opValue, opInst] = this[assignmentToBinary[op]](scope, value, this);
    const [retValue, retInst] = this["="](scope, opValue);
    return [retValue, [...opInst, ...retInst]];
  };
}

for (const key of updateOperators) {
  BaseValue.prototype[key] = function (
    this: IValue,
    scope: IScope,
    prefix: boolean,
    out?: TEOutput
  ): TValueInstructions {
    let [ret, inst] = this.eval(scope);
    if (!prefix) {
      const temp = StoreValue.out(scope, out);
      const tempValue = pipeInsts(temp["="](scope, ret), inst);
      ret = tempValue;
    }
    const kind = key === "++" ? "+=" : "-=";
    return [ret, [...inst, ...this[kind](scope, new LiteralValue(1))[1]]];
  };
}
