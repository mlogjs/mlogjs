import { es, THandler } from "../types";

export const BlockStatement: THandler = (
  c,
  scope,
  context,
  node: es.BlockStatement,
) => {
  return c.handleMany(scope.createScope(), context, node.body);
};
