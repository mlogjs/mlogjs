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
  operatorMap,
  updateOperators,
} from "../operators";
import {
  EMutability,
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue, VoidValue, StoreValue, SenseableValue } from ".";
import { isDiscardedOut, pipeInsts } from "../utils";
import { JumpOutValue } from "./JumpOutValue";

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
    const inst: IInstruction[] = [];
    const falseLiteral = new LiteralValue(0);
    const that = pipeInsts(this.eval(scope), inst);
    const result = pipeInsts(that["=="](scope, falseLiteral, out), inst);
    return [result, inst];
  }

  "~"(scope: IScope, out?: TEOutput): TValueInstructions {
    const [that, inst] = this.eval(scope);
    const temp = StoreValue.from(scope, out);
    return [temp, [...inst, new OperationInstruction("not", temp, that, null)]];
  }

  // requires special handling
  // the handler should give an object value to allow the lazy evaluation
  "??"(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    const result = SenseableValue.from(scope, out, EMutability.mutable);

    const nullLiteral = new LiteralValue(null);
    const endAdress = new LiteralValue(null);
    const [left, leftInst] = this.eval(scope, result);
    const [right, rightInst] = other.eval(scope, result);
    const [test, testInst] = this["==="](scope, nullLiteral);

    return [
      result,
      [
        ...leftInst,
        ...result["="](scope, left)[1],
        ...testInst,
        new JumpInstruction(
          endAdress,
          EJumpKind.Equal,
          test,
          new LiteralValue(0)
        ),
        ...rightInst,
        ...result["="](scope, right)[1],
        new AddressResolver(endAdress),
      ],
    ];
  }

  "!=="(scope: IScope, other: IValue, out?: TEOutput): TValueInstructions {
    if (out instanceof JumpOutValue && out.canHandle("!==")) {
      const [left, leftInst] = this.eval(scope);
      const [right, rightInst] = other.eval(scope);
      return [out, [...leftInst, ...rightInst, out.handle("!==", left, right)]];
    }

    const [equal, equalInst] = this["==="](scope, other);
    const [result, resultInst] = equal["!"](scope, out);

    return [result, [...equalInst, ...resultInst]];
  }
}

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

    if (out instanceof JumpOutValue && out.canHandle(key)) {
      const jump = out.handle(key, left, right);
      return [out, [...leftInst, ...rightInst, jump]];
    }

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
    if (!prefix && !isDiscardedOut(out)) {
      const temp = StoreValue.from(scope, out);
      pipeInsts(temp["="](scope, ret), inst);
      ret = temp;
    }
    const kind = key === "++" ? "+=" : "-=";
    pipeInsts(this[kind](scope, new LiteralValue(1)), inst);
    return [ret, inst];
  };
}
