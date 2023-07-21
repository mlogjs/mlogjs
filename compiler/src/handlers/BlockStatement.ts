import { es, IValue, THandler } from "../types";

export const BlockStatement: THandler<IValue | null> = (
  c,
  scope,
  node: es.BlockStatement,
) => {
  return c.handleMany(scope.createScope(), node.body);
};
