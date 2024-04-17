import { es, THandler } from "../types";

export const BlockStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.BlockStatement,
) => {
  return c.handleMany(scope.createScope(), cursor, node.body);
};
