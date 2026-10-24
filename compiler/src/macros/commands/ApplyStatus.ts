import { IValue } from "../../types";
import { InstructionBase } from "../../instructions";
import { assertLiteralOneOf } from "../../utils";
import { LiteralValue, ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

const validEffects = [
  "none",
  "burning",
  "freezing",
  "unmoving",
  "slow",
  "fast",
  "wet",
  "muddy",
  "melting",
  "sapped",
  "tarred",
  "overdrive",
  "overclock",
  "shielded",
  "shocked",
  "blasted",
  "corroded",
  "boss",
  "spore-slowed",
  "disarmed",
  "electrified",
  "invincible",
  "dynamic",
] as const;

export class ApplyStatus extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        apply: {
          args: ["status", "unit", { key: "duration", default: "10" }],
        },
        clear: { args: ["status", "unit"] },
      },
      handler(scope, overload, out, effect, unit, duration) {
        let effectValue: IValue | string = effect;
        if (effect instanceof LiteralValue && effect.isString()) {
          if (effect.data.startsWith("@status-")) {
            effectValue = effect.data;
          } else {
            assertLiteralOneOf(effect, validEffects, "The status effect");
            effectValue = `@status-${effect.data}`;
          }
        }

        const instArgs: (IValue | string)[] = [
          "status",
          String(overload !== "apply"),
          effectValue,
          unit,
        ];
        if (duration) instArgs.push(duration);

        return [null, [new InstructionBase(...instArgs)]];
      },
    });
    super(data);
  }
}
