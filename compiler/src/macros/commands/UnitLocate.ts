import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../../values";
import { CompilerError } from "../../CompilerError";
import { assertLiteralOneOf } from "../../assertions";

const validFinds = ["ore", "building", "spawn", "damaged"] as const;

const validBuildingGroups = [
  "core",
  "storage",
  "generator",
  "turret",
  "factory",
  "repair",
  "rally",
  "battery",
  "reactor",
] as const;

export class UnitLocate extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (find, ...args) => {
      assertLiteralOneOf(find, validFinds, "The unitLocate find");

      if (
        args.some(
          value =>
            !(value instanceof StoreValue || value instanceof LiteralValue)
        )
      )
        throw new CompilerError(
          "The others arguments of unitLocate must be literals or stores"
        );

      const outFound = new StoreValue(scope);
      const outX = new StoreValue(scope);
      const outY = new StoreValue(scope);
      const outBuilding = new SenseableValue(scope);
      const outArgs = [outX, outY, outFound, outBuilding];
      let inputArgs: (IValue | string)[] = [];
      switch (find.data) {
        case "ore": {
          const [ore] = args;
          inputArgs = [find.data, "core", "true", ore];
          break;
        }
        case "building": {
          const [group, enemy] = args;

          assertLiteralOneOf(group, validBuildingGroups, "The building group");

          inputArgs = [find.data, group.data, enemy, "@copper"];
          break;
        }
        case "spawn":
        case "damaged": {
          inputArgs = [find.data, "core", "true", "@copper"];
          break;
        }
      }
      return [
        ObjectValue.fromArray(scope, [
          outFound,
          outX,
          outY,
          ...(find.data !== "ore" ? [outBuilding] : []),
        ]),
        [new InstructionBase("ulocate", ...inputArgs, ...outArgs)],
      ];
    });
  }
}
