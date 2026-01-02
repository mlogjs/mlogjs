import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";

export class UnitBind extends MacroFunction {
  constructor() {
    super((c, cursor, loc, unitId) => {
      const unit = c.getValue(unitId);
      if (!(unit instanceof StoreValue))
        throw new CompilerError("The unitBind unit must be a store");

      cursor.addInstruction(
        new NativeInstruction(["ubind", unitId], [unitId], [], loc),
      );

      return c.nullId;
    });
  }
}
