import { CompilerError } from "../CompilerError";
import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import {
  AssignementOperator,
  BinaryOperator,
  LogicalOperator,
} from "../operators";
import { THandler, es } from "../types";
import { LiteralValue, StoreValue } from "../values";

export const LRExpression: THandler = (
  c,
  scope,
  node: {
    left: es.Node;
    right: es.Node;
    operator: AssignementOperator | BinaryOperator | LogicalOperator;
  }
) => {
  const [left, leftInst] = c.handleConsume(scope, node.left);
  const [right, rightInst] = c.handleConsume(scope, node.right);
  const [op, opInst] = left[node.operator](scope, right);
  return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const BinaryExpression: THandler = LRExpression;
export const LogicalExpression: THandler = (
  c,
  scope,
  node: es.LogicalExpression
) => {
  if (node.operator !== "??") return LRExpression(c, scope, node, null);

  const nullLiteral = new LiteralValue(scope, null as never);
  const endAdress = new LiteralValue(scope, null as never);

  const [left, leftInst] = c.handleEval(scope, node.left);

  const [nullTest] = left["=="](scope, nullLiteral);

  if (nullTest instanceof LiteralValue) {
    if (nullTest.data) return c.handleEval(scope, node.right);
    else return [left, leftInst];
  }

  const [right, rightInst] = c.handleEval(scope, node.right);

  const result: StoreValue = new StoreValue(scope);
  result.ensureOwned();

  return [
    result,
    [
      ...leftInst,
      ...result["="](scope, left)[1],
      new JumpInstruction(endAdress, EJumpKind.NotEqual, left, nullLiteral),
      ...rightInst,
      ...result["="](scope, right)[1],
      new AddressResolver(endAdress),
    ],
  ];
};

export const AssignmentExpression: THandler = (
  c,
  scope,
  node: {
    left: es.Node;
    right: es.Node;
    operator: AssignementOperator | BinaryOperator | LogicalOperator;
  }
) => {
  const [left, leftInst] = c.handle(scope, node.left);
  // doesn't need to consume because the operators already do that
  const [right, rightInst] = c.handleEval(scope, node.right);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [op, opInst] = left![node.operator](scope, right);
  return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const UnaryExpression: THandler = (
  c,
  scope,
  { argument, operator }: es.UnaryExpression
) => {
  const [arg, argInst] = c.handleConsume(scope, argument);
  const operatorId =
    operator == "+" || operator == "-" ? (`u${operator}` as const) : operator;
  if (operatorId === "throw")
    throw new CompilerError("throw operator is not supported");

  const [op, opInst] = arg[operatorId](scope);
  return [op, [...argInst, ...opInst]];
};
export const UpdateExpression: THandler = (
  c,
  scope,
  { argument, operator, prefix }: es.UpdateExpression
) => {
  const [arg, argInst] = c.handle(scope, argument);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [op, opInst] = arg![operator](scope, prefix);
  return [op, [...argInst, ...opInst]];
};

export const ConditionalExpression: THandler = (
  c,
  scope,
  node: es.ConditionalExpression
) => {
  const [test, testInst] = c.handleConsume(scope, node.test);
  if (test instanceof LiteralValue) {
    if (test.data) return c.handleEval(scope, node.consequent);
    return c.handleEval(scope, node.alternate);
  }
  // TODO: this creates those annoying jumps on the
  // temp counter, specially if you nest ternary operators
  const result: StoreValue = new StoreValue(scope);
  result.ensureOwned();
  const consequent = c.handleEval(scope, node.consequent);
  const alternate = c.handleEval(scope, node.alternate);
  const alternateStartAdress = new LiteralValue(scope, null as never);
  const endExpressionAdress = new LiteralValue(scope, null as never);

  return [
    result,
    [
      ...testInst,
      new JumpInstruction(
        alternateStartAdress,
        EJumpKind.Equal,
        test,
        new LiteralValue(scope, 0)
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
