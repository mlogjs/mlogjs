import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { LiteralValue, SenseableValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import {
  assertIsArrayMacro,
  assertIsObjectMacro,
  assertLiteralOneOf,
} from "../../assertions";
import { EMutability } from "../../types";

export const validRadarFilters = [
  "any",
  "enemy",
  "ally",
  "player",
  "attacker",
  "flying",
  "boss",
  "ground",
] as const;

export const validRadarSorts = [
  "distance",
  "health",
  "shield",
  "armor",
  "maxHealth",
] as const;

export class Radar extends MacroFunction {
  constructor() {
    super((scope, out, options) => {
      assertIsObjectMacro(options, "The radar options");

      const { building, filters, order, sort } = options.data;
      if (!(building instanceof SenseableValue))
        throw new CompilerError("The building must a senseable value");

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

      const outUnit = SenseableValue.out(scope, out, EMutability.constant);
      return [
        outUnit,
        [
          new InstructionBase(
            "radar",
            filter1.data,
            filter2.data,
            filter3.data,
            sort.data,
            building,
            order,
            outUnit
          ),
        ],
      ];
    });
  }
}
