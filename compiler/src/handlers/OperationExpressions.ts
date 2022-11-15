import { CompilerError } from "../CompilerError";
import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import {
  AssignementOperator,
  BinaryOperator,
  LogicalOperator,
  orderIndependentOperators,
} from "../operators";
import { THandler, es, IInstruction } from "../types";
import { discardedName } from "../utils";
import { LazyValue, LiteralValue, SenseableValue } from "../values";

export const LRExpression: THandler = (
  c,
  scope,
  node: {
    left: es.Node;
    right: es.Node;
    operator: BinaryOperator | LogicalOperator;
  },
  out
) => {
  const [left, leftInst] = c.handleEval(scope, node.left);
  const [right, rightInst] = c.handleEval(scope, node.right);

  if (!(left instanceof LiteralValue) || !(right instanceof LiteralValue)) {
    const cachedResult = scope.getCachedOperation(node.operator, left, right);
    if (cachedResult) return [cachedResult, [...leftInst, ...rightInst]];

    // because a * b is the same as b * a
    if (orderIndependentOperators.includes(node.operator)) {
      const cachedResult = scope.getCachedOperation(node.operator, right, left);
      if (cachedResult) return [cachedResult, [...leftInst, ...rightInst]];
    }
  }

  const [op, opInst] = left[node.operator](scope, right, out);

  if (!(op instanceof LiteralValue)) {
    scope.addCachedOperation(node.operator, op, left, right);
  }

  return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const BinaryExpression: THandler = LRExpression;
export const LogicalExpression: THandler = (
  c,
  scope,
  node: es.LogicalExpression,
  out
) => {
  if (node.operator !== "??")
    return LRExpression(c, scope, node, undefined, null);

  const other = new LazyValue((scope, out) =>
    c.handleEval(scope, node.right, out)
  );

  const [left, leftInst] = c.handleEval(scope, node.left);
  const [result, resultInst] = left["??"](scope, other, out);
  return [result, [...leftInst, ...resultInst]];
};

export const AssignmentExpression: THandler = (
  c,
  scope,
  node: es.AssignmentExpression & {
    operator: AssignementOperator;
  }
) => {
  const [left, leftInst] = c.handle(scope, node.left);
  if (left) scope.clearDependentCache(left);
  const [right, rightInst] =
    node.operator !== "??="
      ? c.handleEval(
          scope,
          node.right,
          node.operator === "=" && left ? left : undefined
        )
      : [
          new LazyValue((scope, out) => c.handleEval(scope, node.right, out)),
          [],
        ];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [op, opInst] = left![node.operator](scope, right);
  return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const UnaryExpression: THandler = (
  c,
  scope,
  { argument, operator }: es.UnaryExpression,
  out
) => {
  const [arg, argInst] = c.handleEval(scope, argument);

  const cachedResult = scope.getCachedOperation(operator, arg);
  if (cachedResult) return [cachedResult, argInst];

  const operatorId =
    operator == "+" || operator == "-" ? (`u${operator}` as const) : operator;
  if (operatorId === "throw")
    throw new CompilerError("throw operator is not supported");

  const [op, opInst] = arg[operatorId](scope, out);
  scope.addCachedOperation(operator, op, arg);
  return [op, [...argInst, ...opInst]];
};
export const UpdateExpression: THandler = (
  c,
  scope,
  { argument, operator, prefix }: es.UpdateExpression,
  out
) => {
  const [arg, argInst] = c.handle(scope, argument);

  if (arg) scope.clearDependentCache(arg);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [op, opInst] = arg![operator](scope, prefix, out);
  return [op, [...argInst, ...opInst]];
};

export const ConditionalExpression: THandler = (
  c,
  scope,
  node: es.ConditionalExpression,
  out
) => {
  const [test, testInst] = c.handleEval(scope, node.test);
  if (test instanceof LiteralValue) {
    if (test.data) return c.handleEval(scope, node.consequent, out);
    return c.handleEval(scope, node.alternate, out);
  }

  const result = SenseableValue.out(scope, out);

  const consequent = c.handleEval(scope, node.consequent, result);
  const alternate = c.handleEval(scope, node.alternate, result);
  const alternateStartAdress = new LiteralValue(null);
  const endExpressionAdress = new LiteralValue(null);

  return [
    result,
    [
      ...testInst,
      new JumpInstruction(
        alternateStartAdress,
        EJumpKind.Equal,
        test,
        new LiteralValue(0)
      ),
      ...consequent[1],
      ...result["="](scope, consequent[0])[1],
      new JumpInstruction(endExpressionAdress, EJumpKind.Always),
      new AddressResolver(alternateStartAdress),
      ...alternate[1],
      ...result["="](scope, alternate[0])[1],
      new AddressResolver(endExpressionAdress),
    ],
  ];
};

export const SequenceExpression: THandler = (
  c,
  scope,
  node: es.SequenceExpression,
  out
) => {
  const { expressions } = node;
  const inst: IInstruction[] = [];

  // compute every expression except the last one
  for (let i = 0; i < expressions.length - 1; i++) {
    const [, exprInst] = c.handleEval(scope, expressions[i], discardedName);
    inst.push(...exprInst);
  }

  const [value, valueInst] = c.handleEval(
    scope,
    expressions[expressions.length - 1],
    out
  );

  return [value, [...inst, ...valueInst]];
};
