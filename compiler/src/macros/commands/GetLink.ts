import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, StoreValue, TempValue } from "../../values";
import { Building } from "../Building";

export class GetLink extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (index: IValue) => {
      if (
        !(index instanceof StoreValue) &&
        (!(index instanceof LiteralValue) || typeof index.data !== "number")
      )
        throw new Error(
          "The getlink index must be a number literal or a store"
        );
      const temp = new TempValue(scope);
      const outBuild = new Building(scope, temp.name);
      return [outBuild, [new InstructionBase("getlink", temp, index)]];
    });
  }
}
