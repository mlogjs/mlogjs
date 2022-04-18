import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, SenseableValue, StoreValue } from "../../values";
import { validRadarFilters, validRadarSorts } from "./Radar";
import { CompilerError } from "../../CompilerError";

export class UnitRadar extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (filter1, filter2, filter3, order, sort) => {
      if (
        !(filter1 instanceof LiteralValue) ||
        typeof filter1.data !== "string" ||
        !(filter2 instanceof LiteralValue) ||
        typeof filter2.data !== "string" ||
        !(filter3 instanceof LiteralValue) ||
        typeof filter3.data !== "string"
      )
        throw new CompilerError("The filters must be string literals");

      if (!validRadarFilters.includes(filter1.data))
        throw new CompilerError("Invalid value for filter1");
      if (!validRadarFilters.includes(filter2.data))
        throw new CompilerError("Invalid value for filter2");
      if (!validRadarFilters.includes(filter3.data))
        throw new CompilerError("Invalid value for filter3");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new CompilerError("The radar order must be a literal or a store");

      if (!(sort instanceof LiteralValue) || typeof sort.data !== "string")
        throw new CompilerError("The radar sort must be a string literal");

      if (!validRadarSorts.includes(sort.data))
        throw new CompilerError("Invalid sort value");

      const outUnit = new SenseableValue(scope);

      return [
        outUnit,
        [
          new InstructionBase(
            "uradar",
            filter1.data,
            filter2.data,
            filter3.data,
            sort.data,
            "0", // I don't know why, but mindustry requires this extra parameter
            order,
            outUnit
          ),
        ],
      ];
    });
  }
}
