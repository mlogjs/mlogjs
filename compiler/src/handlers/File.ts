import { SetInstruction } from "../instructions";
import { Scope } from "../Scope";
import { es, IInstruction, IValue, THandler } from "../types";

export const File: THandler<IValue | null> = (c, scope, node: es.File) => {
  const [value, instructions] = c.handle(scope ?? new Scope({}), node.program);

  for (const inst of instructions) {
    if (isUnusedSetInst(inst)) {
      inst.hidden = true;
    }
  }
  return [value, instructions];
};

function isUnusedSetInst(inst: IInstruction) {
  return inst instanceof SetInstruction && !(inst.args[1] as IValue).owner;
}
