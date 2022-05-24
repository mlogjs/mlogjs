import { Scope } from "../Scope";
import { es, IValue, THandler } from "../types";

export const File: THandler<IValue | null> = (c, scope, node: es.File) => {
  return c.handle(scope ?? new Scope({}), node.program);
};
