import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { LiteralValue, ObjectValue, StoreValue } from "../../values";
import { assertLiteralOneOf } from "../../utils";
import { createOverloadNamespace } from "../util";
import { CompilerError } from "../../CompilerError";
import { discardedName, extractDestrucuringOut } from "../../utils";

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
      handler(scope, overload, out, ...args) {
        const outFound = StoreValue.from(scope, extractDestrucuringOut(out, 0));

        const outX = StoreValue.from(scope, extractDestrucuringOut(out, 1));
        const outY = StoreValue.from(scope, extractDestrucuringOut(out, 2));
        const outBuilding = StoreValue.from(
          scope,
          overload === "ore" ? discardedName : extractDestrucuringOut(out, 3),
        );
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
                "The building group must be a string literal",
              );

            assertLiteralOneOf(
              group,
              validBuildingGroups,
              "The building group",
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
