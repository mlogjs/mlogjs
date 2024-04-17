import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { ImmutableId, NativeInstruction } from "../../flow";

export class Sensor extends MacroFunction {
  constructor() {
    super((c, cursor, loc, propertyId, targetId) => {
      const property = c.getValueOrTemp(propertyId);
      const target = c.getValueOrTemp(targetId);
      if (!(property instanceof StoreValue))
        throw new CompilerError("The sensor property must be a store");

      if (!(target instanceof StoreValue))
        throw new CompilerError("The sensor target must be a store value");

      const out = new ImmutableId();

      cursor.addInstruction(
        new NativeInstruction(
          ["sensor", out, targetId, propertyId],
          [targetId, propertyId],
          [out],
          loc,
        ),
      );

      return out;
    });
  }
}
