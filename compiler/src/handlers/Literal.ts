import { CompilerError } from "../CompilerError";
import { LoadLiteralInstruction } from "../flow";
import { SourceRange } from "../SourceRange";
import { THandler, es } from "../types";
import { LiteralValue } from "../values";

const Literal: THandler = (
  c,
  scope,
  cursor,
  node: es.StringLiteral | es.NumericLiteral,
) => {
  const out = c.registerValue(new LiteralValue(node.value));
  cursor.addInstruction(
    new LoadLiteralInstruction(node.value, out, SourceRange.fromNode(node)),
  );
  return out;
};

export const NumericLiteral = Literal;
export const StringLiteral = Literal;

export const NullLiteral: THandler = () => {
  throw new CompilerError(
    "`null` is no longer supported, use `undefined` instead",
  );
};

export const BooleanLiteral: THandler = (
  c,
  scope,
  cursor,
  node: es.BooleanLiteral,
) => {
  const out = c.registerValue(new LiteralValue(+node.value));
  cursor.addInstruction(
    new LoadLiteralInstruction(+node.value, out, SourceRange.fromNode(node)),
  );
  return out;
};
