import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  BreakInstruction,
  ContinueInstruction,
} from "../instructions";
import { es, IScope, IValue, THandler } from "../types";
import { LiteralValue } from "../values";

export const ExpressionStatement: THandler<IValue | null> = (
  c,
  scope,
  node: es.ExpressionStatement
) => {
  return c.handle(scope, node.expression);
};

export const BreakStatement: THandler<null> = (
  _,
  scope,
  node: es.BreakStatement
) => {
  const label = node.label?.name;

  const target = label ? findScopeLabel(scope, label) : scope;
  const addr = new LiteralValue(null as never);
  target.break.bind(addr);

  return [null, [new BreakInstruction(addr)]];
};

export const ContinueStatement: THandler<null> = (
  _,
  scope,
  node: es.ContinueStatement
) => {
  const addr = new LiteralValue(null as never);

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
  const [arg, argInst] = node.argument
    ? c.handle(scope, node.argument)
    : [null, []];
  const [ret, retInst] = scope.function.return(scope, arg, out);
  return [ret, [...argInst, ...retInst]];
};

export const LabeledStatement: THandler<null> = (
  c,
  scope,
  node: es.LabeledStatement
) => {
  const inner = scope.createScope();
  inner.label = node.label.name;

  const end = new LiteralValue(null as never);
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
