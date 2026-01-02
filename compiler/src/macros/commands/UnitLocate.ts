import { LiteralValue, ObjectValue } from "../../values";
import { assertLiteralOneOf } from "../../utils";
import { createOverloadNamespace, filterIds } from "../util";
import { CompilerError } from "../../CompilerError";
import { ICompilerContext } from "../../CompilerContext";
import { ImmutableId, NativeInstruction } from "../../flow";

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
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
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
      handler(scope, overload, cursor, loc, ...args) {
        const outFound = c.createImmutableId();
        const outX = c.createImmutableId();
        const outY = c.createImmutableId();
        const outBuilding = c.createImmutableId();

        const outArgs = [outX, outY, outFound, outBuilding];
        const inputArgs: (string | ImmutableId)[] = [
          overload,
          "core",
          "true",
          "@copper",
        ];
        switch (overload) {
          case "ore": {
            const [ore] = args;
            inputArgs[3] = ore;
            break;
          }
          case "building": {
            const [groupId, enemy] = args;

            const group = c.getValue(groupId as ImmutableId);
            if (!(group instanceof LiteralValue))
              throw new CompilerError(
                "The building group must be a string literal",
              );

            assertLiteralOneOf(
              group,
              validBuildingGroups,
              "The building group",
            );

            inputArgs[1] = group.data;
            inputArgs[2] = enemy;

            break;
          }
        }

        cursor.addInstruction(
          new NativeInstruction(
            ["ulocate", ...inputArgs, ...outArgs],
            filterIds(inputArgs),
            outArgs,
            loc,
          ),
        );

        return c.registerValue(
          ObjectValue.fromArray(c, [
            outFound,
            outX,
            outY,
            ...(overload !== "ore" ? [outBuilding] : []),
          ]),
        );
      },
    });
    super(data);
  }
}
