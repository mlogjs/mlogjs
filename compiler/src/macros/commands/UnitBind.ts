import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { StoreValue, TempValue } from "../../values";

export class UnitBind extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, type => {
      if (!(type instanceof StoreValue))
        throw new Error("The unitBind type must be a store");

      return [null, [new InstructionBase("ubind", type)]];
    });
  }
}
