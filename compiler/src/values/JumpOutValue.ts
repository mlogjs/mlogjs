import { CompilerError } from "../CompilerError";
import { EJumpKind, JumpInstruction } from "../instructions";
import { Operator, operatorMap, comparisonBinaryOperators } from "../operators";
import {
  es,
  IBindableValue,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { VoidValue } from "./VoidValue";

const invertedOperatorMap = {
  "==": operatorMap["!="],
  "!=": operatorMap["=="],
  "!==": operatorMap["==="],
  ">": operatorMap["<="],
  "<": operatorMap[">="],
  ">=": operatorMap["<"],
  "<=": operatorMap[">"],
} as const satisfies Partial<Record<Operator, string>>;

type WhenFalseOperator = keyof typeof invertedOperatorMap;
type WhenTrueOperator = Exclude<
  (typeof comparisonBinaryOperators)[number],
  "!=="
>;

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
  ): operator is WhenTrueOperator | WhenFalseOperator {
    if (this.whenTrue) {
      return (
        operator in operatorMap &&
        Object.values(EJumpKind).includes(operatorMap[operator as never])
      );
    }
    return operator in invertedOperatorMap;
  }

  handle(
    operator: WhenTrueOperator | WhenFalseOperator,
    left: IValue,
    right: IValue
  ) {
    let kind: EJumpKind;
    if (this.whenTrue) {
      if (operator === "!==")
        throw new CompilerError('Unsupported jump compression operator "!=="');
      kind = mapOperator(operator);
    } else {
      if (operator === "===")
        throw new CompilerError('Unsupported jump compression operator "==="');
      kind = mapInverseOperator(operator);
    }
    const jump = new JumpInstruction(this.address, kind, left, right);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    jump.source = this.node.loc!;
    return jump;
  }

  eval(_scope: IScope, _out?: TEOutput): TValueInstructions<IValue> {
    return [this, []];
  }
}
function mapOperator(operator: WhenTrueOperator): EJumpKind {
  switch (operator) {
    case "!=":
      return EJumpKind.NotEqual;
    case "<":
      return EJumpKind.LessThan;
    case "<=":
      return EJumpKind.LessThanEq;
    case "==":
      return EJumpKind.Equal;
    case "===":
      return EJumpKind.StrictEqual;
    case ">":
      return EJumpKind.GreaterThan;
    case ">=":
      return EJumpKind.GreaterThanEq;
  }
}
function mapInverseOperator(operator: WhenFalseOperator): EJumpKind {
  switch (operator) {
    case "!=":
      return EJumpKind.Equal;
    case "!==":
      return EJumpKind.StrictEqual;
    case "<":
      return EJumpKind.GreaterThanEq;
    case "<=":
      return EJumpKind.GreaterThan;
    case "==":
      return EJumpKind.NotEqual;
    case ">":
      return EJumpKind.LessThanEq;
    case ">=":
      return EJumpKind.LessThan;
  }
}
