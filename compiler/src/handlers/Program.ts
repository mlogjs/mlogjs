import { Scope } from "../Scope";
import { es, THandler } from "../types";

export const Program: THandler = (c, scope, node: es.Program) => {
  return c.handleMany(scope ?? new Scope({}), node.body);
};
