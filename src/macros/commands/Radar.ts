import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, StoreValue } from "../../values";

const validFilters = [
  "any",
  "enemy",
  "ally",
  "player",
  "attacker",
  "flying",
  "boss",
  "ground",
];

const validSorts = ["distance", "health", "shield", "armor", "maxHealth"];

export class Radar extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (building, filter1, filter2, filter3, order, sort) => {
      if (!(building instanceof StoreValue))
        throw new Error("The building must a store");

      if (
        !(filter1 instanceof LiteralValue) ||
        typeof filter1.data !== "string" ||
        !(filter2 instanceof LiteralValue) ||
        typeof filter2.data !== "string" ||
        !(filter3 instanceof LiteralValue) ||
        typeof filter3.data !== "string"
      )
        throw new Error("The filters must be string literals");

      if (!validFilters.includes(filter1.data))
        throw new Error("Invalid value for filter1");
      if (!validFilters.includes(filter2.data))
        throw new Error("Invalid value for filter2");
      if (!validFilters.includes(filter3.data))
        throw new Error("Invalid value for filter3");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new Error("The radar order must be a literal or a store");

      if (!(sort instanceof LiteralValue) || typeof sort.data !== "string")
        throw new Error("The radar sort must be a string literal");

      return [
        null,
        [
          new InstructionBase(
            "control",
            building,
            filter1.data,
            filter2.data,
            filter3.data,
            order,
            sort.data
          ),
        ],
      ];
    });
  }
}
