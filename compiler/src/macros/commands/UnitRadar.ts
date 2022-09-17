import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, SenseableValue, StoreValue } from "../../values";
import { validRadarFilters, validRadarSorts } from "./Radar";
import { CompilerError } from "../../CompilerError";
import { assertLiteralOneOf } from "../../assertions/literals";

export class UnitRadar extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (filter1, filter2, filter3, order, sort) => {
      assertLiteralOneOf(filter1, validRadarFilters, "The first filter");
      assertLiteralOneOf(filter2, validRadarFilters, "The second filter");
      assertLiteralOneOf(filter3, validRadarFilters, "The third filter");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new CompilerError("The radar order must be a literal or a store");

      assertLiteralOneOf(sort, validRadarSorts, "The radar sort");

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
