import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { ObjectValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { createTemp } from "../../utils";

export class Sensor extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (property, target) => {
      if (!(property instanceof StoreValue))
        throw new CompilerError("The sensor property must be a store");

      if (!(target instanceof ObjectValue))
        throw new CompilerError("The sensor target must be a store");

      const temp = createTemp(scope);
      return [temp, [new InstructionBase("sensor", temp, target, property)]];
    });
  }
}
