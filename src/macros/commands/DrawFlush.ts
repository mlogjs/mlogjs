import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { StoreValue } from "../../values";

export class DrawFlush extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (target: IValue) => {
      if (!(target instanceof StoreValue))
        throw new Error("The drawflush target must be a building");
      return [null, [new InstructionBase("printflush", target)]];
    });
  }
}
