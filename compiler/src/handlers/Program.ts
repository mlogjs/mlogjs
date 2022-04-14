import { hoistFunctions } from "../utils";
import { Scope } from "../Scope";
import { es, THandler } from "../types";

export const Program: THandler<null> = (c, scope, node: es.Program) => {
  return c.handleMany(scope ?? new Scope({}), hoistFunctions(node.body));
};
