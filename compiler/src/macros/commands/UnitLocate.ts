import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, ObjectValue, StoreValue } from "../../values";
import { Building } from "../Building";
import { CompilerError } from "../../CompilerError";

const validFinds = ["ore", "building", "spawn", "damaged"];

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
];

export class UnitLocate extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (find, ...args) => {
      if (!(find instanceof LiteralValue && typeof find.data === "string"))
        throw new CompilerError("The unitLocate find must be a string literal");

      if (!validFinds.includes(find.data))
        throw new CompilerError("Invalid find value");

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
      const outBuilding = new Building(scope);
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

          if (
            !(group instanceof LiteralValue && typeof group.data === "string")
          ) {
            throw new CompilerError(
              "The building group must be a string literal"
            );
          }
          if (!validBuildingGroups.includes(group.data))
            throw new CompilerError("Invalid building group");

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
