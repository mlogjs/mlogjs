import { THandler, es } from "../types";
import { LiteralValue } from "../values";

const Literal: THandler = (
  _c,
  scope,
  node: es.StringLiteral | es.NumericLiteral
) => [new LiteralValue(node.value), []];

export const NumericLiteral = Literal;
export const StringLiteral = Literal;

export const NullLiteral: THandler = () => [new LiteralValue(null), []];

export const BooleanLiteral: THandler = (
  _c,
  scope,
  node: es.BooleanLiteral
) => [new LiteralValue(+node.value), []];
