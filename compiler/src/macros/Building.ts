import { IScope, IValue } from "../types";
import { LiteralValue, ObjectValue } from "../values";
import { MacroFunction } from "./Function";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";
import { Building } from "./Entities";

export class BuildingBuilder extends ObjectValue {
  constructor(scope: IScope) {
    super(scope, {
      $call: new MacroFunction(scope, (nameLit: IValue) => {
        if (!(nameLit instanceof LiteralValue))
          throw new CompilerError("Block name must be a literal.");
        if (typeof nameLit.data !== "string")
          throw new CompilerError("Block name must be a string.");
        const owner = new ValueOwner({
          scope,
          value: new Building(scope),
          name: nameLit.data,
        });
        return [owner.value, []];
      }),
    });
  }
}
