import { CompilerError } from "../CompilerError";
import { EJumpKind, JumpInstruction } from "../instructions";
import { BinaryOperator } from "../operators";
import {
  es,
  IBindableValue,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { VoidValue } from "./VoidValue";

const operatorMap = {
  "!=": EJumpKind.NotEqual,
  "<": EJumpKind.LessThan,
  "<=": EJumpKind.LessThanEq,
  "==": EJumpKind.Equal,
  "===": EJumpKind.StrictEqual,
  ">": EJumpKind.GreaterThan,
  ">=": EJumpKind.GreaterThanEq,
} as const satisfies Partial<Record<BinaryOperator, EJumpKind>>;

const invertedOperatorMap = {
  "==": operatorMap["!="],
  "!=": operatorMap["=="],
  "!==": operatorMap["==="],
  ">": operatorMap["<="],
  "<": operatorMap[">="],
  ">=": operatorMap["<"],
  "<=": operatorMap[">"],
} as const satisfies Partial<Record<BinaryOperator, EJumpKind>>;

type TWhenFalseOperator = keyof typeof invertedOperatorMap;
type TWhenTrueOperator = keyof typeof operatorMap;

export class JumpOutValue extends VoidValue {
  macro = true;

  constructor(
    public node: es.Node,
    public address: IBindableValue<number | null>,
    public whenTrue: boolean
  ) {
    super();
  }

  canHandle(
    operator: string
  ): operator is TWhenTrueOperator | TWhenFalseOperator {
    if (this.whenTrue) return operator in operatorMap;
    return operator in invertedOperatorMap;
  }

  handle(
    operator: TWhenTrueOperator | TWhenFalseOperator,
    left: IValue,
    right: IValue
  ) {
    let kind: EJumpKind;
    if (this.whenTrue) {
      if (operator === "!==")
        throw new CompilerError('Unsupported jump compression operator "!=="');
      kind = operatorMap[operator];
    } else {
      if (operator === "===")
        throw new CompilerError('Unsupported jump compression operator "==="');
      kind = invertedOperatorMap[operator];
    }
    const jump = new JumpInstruction(this.address, kind, left, right);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    jump.source = this.node.loc!;
    return jump;
  }

  eval(_scope: IScope, _out?: TEOutput): TValueInstructions<IValue> {
    return [this, []];
  }

  debugString(): string {
    return "JumpOutValue";
  }

  toString(): string {
    return "[macro JumpOutValue]";
  }
}
