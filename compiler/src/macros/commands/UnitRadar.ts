import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { LiteralValue, StoreValue } from "../../values";
import { validRadarFilters, validRadarSorts } from "./Radar";
import { CompilerError } from "../../CompilerError";
import {
  assertIsArrayMacro,
  assertIsObjectMacro,
  assertLiteralOneOf,
} from "../../utils";

export class UnitRadar extends MacroFunction {
  constructor() {
    super((c, out, options) => {
      assertIsObjectMacro(options, "The radar options");

      const filters = c.getValue(options.data.filters);
      const order = c.getValue(options.data.order);
      const sort = c.getValue(options.data.sort);

      assertIsArrayMacro(c, filters, "filters");

      const length = c.getValue(filters.data.length);

      if (!(length instanceof LiteralValue) || !length.isNumber())
        throw new CompilerError("The length of an array macro must be");

      if (length.data !== 3)
        throw new CompilerError("The filters array must have 3 items");

      // data is not an array
      const filter1 = c.getValue(filters.data[0]);
      const filter2 = c.getValue(filters.data[1]);
      const filter3 = c.getValue(filters.data[2]);

      assertLiteralOneOf(filter1, validRadarFilters, "The first filter");
      assertLiteralOneOf(filter2, validRadarFilters, "The second filter");
      assertLiteralOneOf(filter3, validRadarFilters, "The third filter");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new CompilerError("The radar order must be a literal or a store");

      assertLiteralOneOf(sort, validRadarSorts, "The radar sort");

      const outUnit = c.getValueOrTemp(out);

      return [
        new InstructionBase(
          "uradar",
          filter1.data,
          filter2.data,
          filter3.data,
          sort.data,
          "0", // I don't know why, but mindustry requires this extra parameter
          order,
          outUnit,
        ),
      ];
    });
  }
}
