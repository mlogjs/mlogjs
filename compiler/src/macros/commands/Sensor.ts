import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { EMutability, IScope } from "../../types";
import { SenseableValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { assign } from "../../utils";

export class Sensor extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (property, target) => {
      if (!(property instanceof StoreValue))
        throw new CompilerError("The sensor property must be a store");

      if (!(target instanceof SenseableValue))
        throw new CompilerError("The sensor target must be a senseable value");

      const temp = assign(new SenseableValue(scope), {
        mutability: EMutability.readonly,
      });
      return [temp, [new InstructionBase("sensor", temp, target, property)]];
    });
  }
}
