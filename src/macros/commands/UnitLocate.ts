import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, ObjectValue, StoreValue, TempValue } from "../../values";
import { validRadarFilters, validRadarSorts } from "./Radar";

const validFinds = ["ore", "building", "spawn", "damaged"];

export class UnitLocate extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (find, ...args) => {
      if (!(find instanceof LiteralValue && typeof find.data === "string"))
        throw new Error("The unitLocate find must be a string literal");

      if (!validFinds.includes(find.data))
        throw new Error("Invalid find value");

      if (
        args.some(
          value =>
            !(value instanceof StoreValue || value instanceof LiteralValue)
        )
      )
        throw new Error(
          "The others arguments of unitLocate must be literals or stores"
        );

      const outFound = new TempValue(scope);
      const outX = new TempValue(scope);
      const outY = new TempValue(scope);
      const outBuilding = new TempValue(scope);
      const outArgs = [outX, outY, outFound, outBuilding];
      let inputArgs: (IValue | string)[] = [];
      switch (find.data) {
        case "ore": {
          const [ore] = args;
          inputArgs = [find.data, "core", "true", ore];
          break;
        }
        case "building": {
          const [group, enemy] = args as [LiteralValue, IValue];
          inputArgs = [find.data, group.data as string, enemy, "@copper"];
          break;
        }
        case "spawn":
        case "damaged": {
          inputArgs = [find.data, "core", "true", "@copper"];
          break;
        }
      }
      return [
        new ObjectValue(scope, {
          0: outFound,
          1: outX,
          2: outY,
          3: outBuilding,
          length: new LiteralValue(scope, find.data === "ore" ? 3 : 4),
        }),
        [new InstructionBase("ulocate", ...inputArgs, ...outArgs)],
      ];
    });
  }
}
