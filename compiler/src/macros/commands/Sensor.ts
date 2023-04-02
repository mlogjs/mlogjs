import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class Sensor extends MacroFunction {
  constructor() {
    super((scope, out, property, target) => {
      if (!(property instanceof StoreValue))
        throw new CompilerError("The sensor property must be a store");

      if (!(target instanceof StoreValue))
        throw new CompilerError("The sensor target must be a store value");

      const temp = StoreValue.from(scope, out);

      return [temp, [new InstructionBase("sensor", temp, target, property)]];
    });
  }
}
