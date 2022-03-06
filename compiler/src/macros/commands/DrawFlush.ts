import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { ObjectValue, StoreValue } from "../../values";

export class DrawFlush extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (target: IValue) => {
      if (!(target instanceof ObjectValue))
        throw new Error("The drawflush target must be a building");
      return [null, [new InstructionBase("drawflush", target)]];
    });
  }
}
