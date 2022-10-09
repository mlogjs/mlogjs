import { THandler, es, TLiteral } from "../types";
import { LiteralValue } from "../values";

const Literal: THandler = (
  _c,
  scope,
  node: es.StringLiteral | es.NumericLiteral
) => [new LiteralValue(node.value as TLiteral), []];

export const NumericLiteral = Literal;
export const StringLiteral = Literal;

export const NullLiteral: THandler = () => [
  new LiteralValue(null as unknown as TLiteral),
  [],
];

export const BooleanLiteral: THandler = (
  _c,
  scope,
  node: es.BooleanLiteral
) => [new LiteralValue(+node.value), []];
