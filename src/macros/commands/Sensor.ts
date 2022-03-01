import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { StoreValue } from "../../values";

export class Sensor extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (property, target) => {
      if (!(property instanceof StoreValue))
        throw new Error("The sensor property must be a store");

      if (!(target instanceof StoreValue))
        throw new Error("The sensor target must be a store");
      return [null, [new InstructionBase("sensor", property, target)]];
    });
  }
}
