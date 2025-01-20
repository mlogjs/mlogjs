import { CompilerError } from "../CompilerError";
import { Block, BreakInstruction, ReturnInstruction } from "../flow";
import { es, IScope, THandler } from "../types";

export const ExpressionStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.ExpressionStatement,
) => {
  return c.handle(scope, cursor, node.expression);
};

export const BreakStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.BreakStatement,
) => {
  const label = node.label?.name;

  const target = findScopeLabel(scope, label);
  cursor.setEndInstruction(new BreakInstruction(target.break, node));

  return c.nullId;
};

export const ContinueStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.ContinueStatement,
) => {
  const label = node.label?.name;

  const target = findScopeLabel(scope, label);
  cursor.setEndInstruction(new BreakInstruction(target.continue, node));

  return c.nullId;
};

export const ReturnStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.ReturnStatement,
) => {
  const arg = node.argument ? c.handle(scope, cursor, node.argument) : c.nullId;

  // TODO: handle return value
  cursor.setEndInstruction(new ReturnInstruction(arg));
  return c.nullId;
};

export const EmptyStatement: THandler = c => c.nullId;

export const LabeledStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.LabeledStatement,
) => {
  const afterLabelBlock = new Block();

  const inner = scope.createScope();
  inner.label = node.label.name;
  inner.break = afterLabelBlock;

  c.handle(inner, cursor, node.body);

  cursor.connectBlock(afterLabelBlock, node);

  return c.nullId;
};

function findScopeLabel(scope: IScope, label: string | undefined) {
  let current: IScope | null = scope;
  while (current !== null) {
    if (current.label === label) return current;
    current = current.parent;
  }

  throw new CompilerError(`Could not find label "${label}"`);
}
