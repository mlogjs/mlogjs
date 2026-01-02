import { es, THandler } from "../types";

export const Program: THandler = (c, scope, cursor, node: es.Program) => {
  return c.handleMany(scope, cursor, node.body);
};
