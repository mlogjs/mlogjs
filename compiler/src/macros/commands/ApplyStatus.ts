import { assertLiteralOneOf } from "../../assertions";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { LiteralValue, ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

const validEffects = [
  "burning",
  "freezing",
  "unmoving",
  "wet",
  "melting",
  "sapped",
  "electrified",
  "spore-slowed",
  "tarred",
  "overdrive",
  "overclock",
  "boss",
  "shocked",
  "blasted",
] as const;

export class ApplyStatus extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      scope,
      overloads: {
        apply: {
          args: ["status", "unit", { key: "duration", default: "10" }],
        },
        clear: { args: ["status", "unit"] },
      },
      handler(overload, effect, unit, duration) {
        if (!(effect instanceof LiteralValue))
          throw new CompilerError("The status effect must be a string literal");
        assertLiteralOneOf(effect, validEffects, "The status effect");

        return [
          null,
          [
            new InstructionBase(
              "status",
              String(overload !== "apply"),
              effect.data,
              unit,
              duration
            ),
          ],
        ];
      },
    });
    super(scope, data);
  }
}
