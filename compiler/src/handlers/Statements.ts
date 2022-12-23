import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  BreakInstruction,
  ContinueInstruction,
} from "../instructions";
import { es, IScope, IValue, THandler } from "../types";
import { discardedName } from "../utils";
import { LazyValue, LiteralValue } from "../values";

export const ExpressionStatement: THandler<IValue | null> = (
  c,
  scope,
  node: es.ExpressionStatement
) => {
  return c.handle(scope, node.expression, undefined, discardedName);
};

export const BreakStatement: THandler<null> = (
  _,
  scope,
  node: es.BreakStatement
) => {
  const label = node.label?.name;

  const target = label ? findScopeLabel(scope, label) : scope;
  const addr = new LiteralValue(null);
  target.break.bind(addr);

  return [null, [new BreakInstruction(addr)]];
};

export const ContinueStatement: THandler<null> = (
  _,
  scope,
  node: es.ContinueStatement
) => {
  const addr = new LiteralValue(null);

  const label = node.label?.name;

  const target = label ? findScopeLabel(scope, label) : scope;
  target.continue.bind(addr);

  return [null, [new ContinueInstruction(addr)]];
};

export const ReturnStatement: THandler<IValue | null> = (
  c,
  scope,
  node: es.ReturnStatement,
  out
) => {
  const { argument } = node;

  const [arg, argInst] = argument
    ? [new LazyValue((scope, out) => c.handleEval(scope, argument, out)), []]
    : [new LiteralValue(null), []];
  const [ret, retInst] = scope.function.return(scope, arg, out);
  return [ret, [...argInst, ...retInst]];
};

export const EmptyStatement: THandler<null> = () => [null, []];

export const LabeledStatement: THandler<null> = (
  c,
  scope,
  node: es.LabeledStatement
) => {
  const inner = scope.createScope();
  inner.label = node.label.name;

  const end = new LiteralValue(null);
  const endAdress = new AddressResolver(end).bindBreak(inner);

  const [, bodyInst] = c.handle(inner, node.body);

  return [null, [...bodyInst, endAdress]];
};

function findScopeLabel(scope: IScope, label: string) {
  let current: IScope | null = scope;
  while (current !== null) {
    if (current.label === label) return current;
    current = current.parent;
  }

  throw new CompilerError(`Could not find label "${label}"`);
}
