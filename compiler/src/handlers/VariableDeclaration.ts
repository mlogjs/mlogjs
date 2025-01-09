import { THandler, es } from "../types";
import { nullId } from "../utils";

export const VariableDeclaration: THandler = (
  c,
  scope,
  cursor,
  node: es.VariableDeclaration,
) => {
  return c.handleMany(scope, cursor, node.declarations, child =>
    VariableDeclarator(c, scope, cursor, child, node.kind),
  );
};

export const VariableDeclarator: THandler = (
  c,
  scope,
  cursor,
  node: es.VariableDeclarator,
  kind: "let" | "var" | "const" = "let",
) => {
  const { id, init } = node;

  const value = init ? c.handle(scope, cursor, init) : undefined;
  c.handleDeclaration(scope, cursor, id, kind, value);

  return nullId;
};
