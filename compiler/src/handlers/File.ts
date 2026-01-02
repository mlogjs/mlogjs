import { Scope } from "../Scope";
import { es, THandler } from "../types";

export const File: THandler = (c, scope, cursor, node: es.File) => {
  return c.handle(scope ?? new Scope({}), cursor, node.program);
};
