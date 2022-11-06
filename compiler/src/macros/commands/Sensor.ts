import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { EMutability } from "../../types";
import { SenseableValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class Sensor extends MacroFunction {
  constructor() {
    super((scope, out, property, target) => {
      if (!(property instanceof StoreValue))
        throw new CompilerError("The sensor property must be a store");

      if (!(target instanceof SenseableValue))
        throw new CompilerError("The sensor target must be a senseable value");

      const temp = SenseableValue.from(scope, out, EMutability.readonly);

      return [temp, [new InstructionBase("sensor", temp, target, property)]];
    });
  }
}
