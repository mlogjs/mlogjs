import { es, THandler } from "../types";

export const Identifier: THandler = (c, scope, node: es.Identifier) => {
  return [scope.get(node.name), []];
};
