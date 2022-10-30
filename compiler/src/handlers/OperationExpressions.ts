import { CompilerError } from "../CompilerError";
import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import {
  AssignementOperator,
  BinaryOperator,
  LogicalOperator,
} from "../operators";
import { THandler, es } from "../types";
import { LazyValue, LiteralValue, SenseableValue } from "../values";

export const LRExpression: THandler = (
  c,
  scope,
  node: {
    left: es.Node;
    right: es.Node;
    operator: AssignementOperator | BinaryOperator | LogicalOperator;
  },
  out
) => {
  const [left, leftInst] = c.handleConsume(scope, node.left);
  const [right, rightInst] = c.handleConsume(scope, node.right);
  const [op, opInst] = left[node.operator](scope, right, out);
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

  const other = new LazyValue({
    eval: (scope, out) => c.handleEval(scope, node.right, out),
    consume: scope => c.handleConsume(scope, node.right),
  });

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
  // doesn't need to consume because the operators already do that
  const [right, rightInst] =
    node.operator !== "??="
      ? c.handleEval(scope, node.right)
      : [
          new LazyValue({
            eval: (scope, out) => c.handleEval(scope, node.right, out),
            consume: scope => c.handleConsume(scope, node.right),
          }),
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
  const [arg, argInst] = c.handleConsume(scope, argument);
  const operatorId =
    operator == "+" || operator == "-" ? (`u${operator}` as const) : operator;
  if (operatorId === "throw")
    throw new CompilerError("throw operator is not supported");

  const [op, opInst] = arg[operatorId](scope, out);
  return [op, [...argInst, ...opInst]];
};
export const UpdateExpression: THandler = (
  c,
  scope,
  { argument, operator, prefix }: es.UpdateExpression,
  out
) => {
  const [arg, argInst] = c.handle(scope, argument);
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
  const [test, testInst] = c.handleConsume(scope, node.test);
  if (test instanceof LiteralValue) {
    if (test.data) return c.handleEval(scope, node.consequent);
    return c.handleEval(scope, node.alternate);
  }

  const result = SenseableValue.out(scope, out);

  const consequent = c.handleEval(scope, node.consequent, result);
  const alternate = c.handleEval(scope, node.alternate, result);
  const alternateStartAdress = new LiteralValue(null as never);
  const endExpressionAdress = new LiteralValue(null as never);

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
