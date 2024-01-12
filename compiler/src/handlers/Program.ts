import { es, THandler } from "../types";

export const Program: THandler = (c, scope, context, node: es.Program) => {
  return c.handleMany(scope, context, node.body);
};
