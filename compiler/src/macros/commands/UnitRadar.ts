import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { LiteralValue, SenseableValue, StoreValue } from "../../values";
import { validRadarFilters, validRadarSorts } from "./Radar";
import { CompilerError } from "../../CompilerError";
import {
  assertIsArrayMacro,
  assertIsObjectMacro,
  assertLiteralOneOf,
} from "../../assertions";
import { EMutability } from "../../types";

export class UnitRadar extends MacroFunction {
  constructor() {
    super((scope, out, options) => {
      assertIsObjectMacro(options, "The radar options");

      const { filters, order, sort } = options.data;

      assertIsArrayMacro(filters, "filters");

      const { length } = filters.data;

      if (!(length instanceof LiteralValue) || !length.isNumber())
        throw new CompilerError("The length of an array macro must be");

      if (length.data !== 3)
        throw new CompilerError("The filters array must have 3 items");

      // data is not an array
      const { 0: filter1, 1: filter2, 2: filter3 } = filters.data;

      assertLiteralOneOf(filter1, validRadarFilters, "The first filter");
      assertLiteralOneOf(filter2, validRadarFilters, "The second filter");
      assertLiteralOneOf(filter3, validRadarFilters, "The third filter");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new CompilerError("The radar order must be a literal or a store");

      assertLiteralOneOf(sort, validRadarSorts, "The radar sort");

      const outUnit = SenseableValue.from(scope, out, EMutability.constant);

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
