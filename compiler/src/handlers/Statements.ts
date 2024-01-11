import { CompilerError } from "../CompilerError";
import { Block, BreakInstruction } from "../flow";
import { es, IScope, THandler } from "../types";
import { nullId } from "../utils";

export const ExpressionStatement: THandler = (
  c,
  scope,
  context,
  node: es.ExpressionStatement,
) => {
  return c.handle(scope, context, node.expression);
};

export const BreakStatement: THandler = (
  c,
  scope,
  context,
  node: es.BreakStatement,
) => {
  const label = node.label?.name;

  const target = findScopeLabel(scope, label);
  context.setEndInstruction(new BreakInstruction(target.break, node));

  return nullId;
};

export const ContinueStatement: THandler = (
  c,
  scope,
  context,
  node: es.ContinueStatement,
) => {
  const label = node.label?.name;

  const target = findScopeLabel(scope, label);
  context.setEndInstruction(new BreakInstruction(target.continue, node));

  return nullId;
};

export const ReturnStatement: THandler = (
  c,
  scope,
  context,
  node: es.ReturnStatement,
) => {
  const arg = node.argument ? c.handle(scope, context, node.argument) : nullId;

  // TODO: handle return value
  // context.setEndInstruction(new ReturnInstruction(arg));
  context.setEndInstruction(new BreakInstruction(context.exit, node));
  return nullId;
};

export const EmptyStatement: THandler = () => nullId;

export const LabeledStatement: THandler = (
  c,
  scope,
  context,
  node: es.LabeledStatement,
) => {
  const afterLabelBlock = new Block([]);

  const inner = scope.createScope();
  inner.label = node.label.name;
  inner.break = afterLabelBlock;

  c.handle(inner, context, node.body);

  context.connectBlock(afterLabelBlock, node);

  return nullId;
};

function findScopeLabel(scope: IScope, label: string | undefined) {
  let current: IScope | null = scope;
  while (current !== null) {
    if (current.label === label) return current;
    current = current.parent;
  }

  throw new CompilerError(`Could not find label "${label}"`);
}
