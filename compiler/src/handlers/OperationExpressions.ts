import {
  AssignementOperator,
  assignmentOperators,
  BinaryOperator,
  LogicalOperator,
  Operator,
  operators,
} from "../operators";
import { THandler, es } from "../types";

export const LRExpression: THandler = (
  c,
  scope,
  node: {
    left: es.Node;
    right: es.Node;
    operator: AssignementOperator | BinaryOperator | LogicalOperator;
  }
) => {
  const [left, leftInst] = c.handleEval(scope, node.left);
  const [right, rightInst] = c.handleEval(scope, node.right);
  const [op, opInst] = left[node.operator](scope, right);
  return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const BinaryExpression: THandler = LRExpression;
export const LogicalExpression: THandler = LRExpression;
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
  const [right, rightInst] = c.handleEval(scope, node.right);
  const [op, opInst] = left![node.operator](scope, right);
  return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const UnaryExpression: THandler = (
  c,
  scope,
  { argument, operator }: es.UnaryExpression
) => {
  const [arg, argInst] = c.handleEval(scope, argument);
  const operatorId =
    operator == "+" || operator == "-" ? (`u${operator}` as const) : operator;
  if (operatorId === "throw") throw Error("throw operator is not supported")

  const [op, opInst] = arg[operatorId](scope);
  return [op, [...argInst, ...opInst]];
};
export const UpdateExpression: THandler = (
  c,
  scope,
  { argument, operator, prefix }: es.UpdateExpression
) => {
  const [arg, argInst] = c.handle(scope, argument);
  const [op, opInst] = arg![operator](scope, prefix);
  return [op, [...argInst, ...opInst]];
};
