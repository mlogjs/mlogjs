import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class UnitBind extends MacroFunction<null> {
  constructor() {
    super((scope, out, type) => {
      if (!(type instanceof StoreValue))
        throw new CompilerError("The unitBind type must be a store");

      return [null, [new InstructionBase("ubind", type)]];
    });
  }
}
