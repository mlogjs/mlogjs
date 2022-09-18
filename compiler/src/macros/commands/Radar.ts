import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, SenseableValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { assertLiteralOneOf } from "../../assertions";

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
  constructor(scope: IScope) {
    super(scope, (building, filter1, filter2, filter3, order, sort) => {
      if (!(building instanceof SenseableValue))
        throw new CompilerError("The building must a senseable value");

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
