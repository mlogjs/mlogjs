import { hoistFunctions } from "../utils";
import { es, IValue, THandler } from "../types";

export const BlockStatement: THandler<IValue | null> = (
  c,
  scope,
  node: es.BlockStatement
) => {
  return c.handleMany(scope.createScope(), hoistFunctions(node.body));
  // const cleanInst = []
  // for (const inst of insts) {
  //     if (inst instanceof BreakInstruction || inst instanceof ContinueInstruction || inst instanceof ReturnInstruction || inst instanceof SetCounterInstruction) break
  //     cleanInst.push(inst)
  // }
  // return [value, insts];
};
