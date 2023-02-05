import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class UnitBind extends MacroFunction<null> {
  constructor() {
    super((scope, out, unit) => {
      if (!(unit instanceof StoreValue))
        throw new CompilerError("The unitBind unit must be a store");

      return [null, [new InstructionBase("ubind", unit)]];
    });
  }
}
