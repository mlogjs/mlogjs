import { Scope } from "../Scope";
import { es, THandler } from "../types";

export const File: THandler = (c, scope, context, node: es.File) => {
  return c.handle(scope ?? new Scope({}), context, node.program);
};
