import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../../values";
import { assertLiteralOneOf } from "../../assertions";
import { createOverloadNamespace } from "../util";
import { CompilerError } from "../../CompilerError";

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

export class UnitLocate extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        ore: {
          args: ["ore"],
        },
        building: { named: "options", args: ["group", "enemy"] },
        spawn: {
          args: [],
        },
        damaged: {
          args: [],
        },
      },
      handler(scope, overload, ...args) {
        const outFound = new StoreValue(scope);
        const outX = new StoreValue(scope);
        const outY = new StoreValue(scope);
        const outBuilding = new SenseableValue(scope);
        const outArgs = [outX, outY, outFound, outBuilding];
        let inputArgs: (IValue | string)[] = [];
        switch (overload) {
          case "ore": {
            const [ore] = args;
            inputArgs = [overload, "core", "true", ore];
            break;
          }
          case "building": {
            const [group, enemy] = args;

            if (!(group instanceof LiteralValue))
              throw new CompilerError(
                "The building group must be a string literal"
              );

            assertLiteralOneOf(
              group,
              validBuildingGroups,
              "The building group"
            );

            inputArgs = [overload, group.data, enemy, "@copper"];
            break;
          }
          case "spawn":
          case "damaged": {
            inputArgs = [overload, "core", "true", "@copper"];
            break;
          }
        }
        return [
          ObjectValue.fromArray([
            outFound,
            outX,
            outY,
            ...(overload !== "ore" ? [outBuilding] : []),
          ]),
          [new InstructionBase("ulocate", ...inputArgs, ...outArgs)],
        ];
      },
    });
    super(data);
  }
}
