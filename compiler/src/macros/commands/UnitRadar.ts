import { MacroFunction } from "..";
import { LiteralValue, StoreValue } from "../../values";
import { validRadarFilters, validRadarSorts } from "./Radar";
import { CompilerError } from "../../CompilerError";
import {
  assertIsArrayMacro,
  assertIsObjectMacro,
  assertLiteralOneOf,
  assertObjectFields,
} from "../../utils";
import { ImmutableId, NativeInstruction } from "../../flow";

export class UnitRadar extends MacroFunction {
  constructor() {
    super((c, cursor, loc, optionsId) => {
      const options = c.getValue(optionsId);
      assertIsObjectMacro(options, "The radar options");

      const [filtersId, orderId, sortId] = assertObjectFields(c, options, [
        "filters",
        "order",
        "sort",
      ]) as ImmutableId[];
      const filters = c.getValue(filtersId);
      const order = c.getValueOrTemp(orderId);
      const sort = c.getValue(sortId);

      assertIsArrayMacro(c, filters, "filters");

      const length = c.getValue(filters.data.length);

      if (!(length instanceof LiteralValue) || !length.isNumber())
        throw new CompilerError("The length of an array macro must be");

      if (length.data !== 3)
        throw new CompilerError("The filters array must have 3 items");

      const filter1 = c.getValue(filters.data[0]);
      const filter2 = c.getValue(filters.data[1]);
      const filter3 = c.getValue(filters.data[2]);

      assertLiteralOneOf(filter1, validRadarFilters, "The first filter");
      assertLiteralOneOf(filter2, validRadarFilters, "The second filter");
      assertLiteralOneOf(filter3, validRadarFilters, "The third filter");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new CompilerError("The radar order must be a literal or a store");

      assertLiteralOneOf(sort, validRadarSorts, "The radar sort");

      const out = new ImmutableId();

      cursor.addInstruction(
        new NativeInstruction(
          [
            "uradar",
            filter1.data,
            filter2.data,
            filter3.data,
            sort.data,
            // uradar uses the same parser as radar, but discards this parameter
            // that indicates the building to use in the radar instruction
            "0",
            orderId,
            out,
          ],
          [orderId],
          [out],
          loc,
        ),
      );

      return out;
    });
  }
}
