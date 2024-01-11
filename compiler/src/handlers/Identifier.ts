import { es, THandler } from "../types";

export const Identifier: THandler = (
  c,
  scope,
  context,
  node: es.Identifier,
) => {
  //   TODO: rewrite scope to use value ids
  return scope.get(node.name) as any as number;
};
