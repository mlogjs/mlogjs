import { CompilerError } from "../CompilerError";
import { THandler, es } from "../types";
import { LiteralValue } from "../values";

const Literal: THandler = (
  c,
  context,
  scope,
  node: es.StringLiteral | es.NumericLiteral,
) => c.registerValue(new LiteralValue(node.value));

export const NumericLiteral = Literal;
export const StringLiteral = Literal;

export const NullLiteral: THandler = () => {
  throw new CompilerError(
    "`null` is no longer supported, use `undefined` instead",
  );
};

export const BooleanLiteral: THandler = (
  c,
  context,
  scope,
  node: es.BooleanLiteral,
) => c.registerValue(new LiteralValue(+node.value));
