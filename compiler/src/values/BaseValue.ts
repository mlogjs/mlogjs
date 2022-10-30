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
import { IScope, IValue, TEOutput, TValueInstructions } from "../types";
import { LiteralValue, VoidValue, StoreValue, SenseableValue } from ".";

export class BaseValue extends VoidValue implements IValue {
  "u-"(scope: IScope, out?: TEOutput): TValueInstructions {
    const [that, inst] = this.consume(scope);
    const temp = StoreValue.out(scope, out);
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
    const [that, inst] = this.consume(scope);
    const temp = StoreValue.out(scope, out);
    const falseLiteral = new LiteralValue(0);
    return [
      temp,
      [...inst, new OperationInstruction("equal", temp, that, falseLiteral)],
    ];
  }

  "~"(scope: IScope, out?: TEOutput): TValueInstructions {
    const [that, inst] = this.consume(scope);
    const temp = StoreValue.out(scope, out);
    return [temp, [...inst, new OperationInstruction("not", temp, that, null)]];
  }

  // requires special handling
  // the handler should give an object value to allow the lazy evaluation
  "??"(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    const result = SenseableValue.out(scope, out);

    const [left, leftInst] = this.eval(scope, result);

    const nullLiteral = new LiteralValue(null as never);
    const endAdress = new LiteralValue(null as never);

    const [nullTest] = left["=="](scope, nullLiteral);

    if (nullTest instanceof LiteralValue) {
      if (nullTest.data) return other.eval(scope, result);
      else return [left, leftInst];
    }

    const [right, rightInst] = other.eval(scope, result);

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
}

const operatorMap: Record<
  Exclude<BinaryOperator | LogicalOperator, "instanceof" | "in" | "??">,
  string
> = {
  "==": "equal",
  "===": "strictEqual",
  "!=": "notEqual",
  "!==": "notEqual",
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
    const [left, leftInst] = this.consume(scope);
    const [right, rightInst] = value.consume(scope);
    const temp = StoreValue.out(scope, out);
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

for (const op in assignmentToBinary) {
  type K = keyof typeof assignmentToBinary;
  BaseValue.prototype[op as K] = function (
    this: IValue,
    scope: IScope,
    value: IValue
  ): TValueInstructions {
    this.ensureOwned();
    const [opValue, opInst] = this[assignmentToBinary[op as K]](scope, value);
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
    let [ret, inst] = this.consume(scope);
    if (!prefix) {
      const temp = StoreValue.out(scope, out);
      const [tempValue, tempInst] = temp["="](scope, ret);
      ret = tempValue;
      inst.push(...tempInst);
    }
    const kind = key === "++" ? "+=" : "-=";
    return [ret, [...inst, ...this[kind](scope, new LiteralValue(1))[1]]];
  };
}
