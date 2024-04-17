import { ICompilerContext } from "../../CompilerContext";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { assertLiteralOneOf, nullId } from "../../utils";
import { LiteralValue, ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

const validEffects = [
  "none",
  "burning",
  "freezing",
  "unmoving",
  "slow",
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
] as const;

export class ApplyStatus extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        apply: {
          args: ["status", "unit", { key: "duration", default: "10" }],
        },
        clear: { args: ["status", "unit"] },
      },
      handler(scope, overload, out, effect, unit, duration) {
        if (!(effect instanceof LiteralValue))
          throw new CompilerError("The status effect must be a string literal");
        assertLiteralOneOf(effect, validEffects, "The status effect");

        c.setAlias(out, nullId);
        return [
          new InstructionBase(
            "status",
            String(overload !== "apply"),
            effect.data,
            unit,
            duration,
          ),
        ];
      },
    });
    super(data);
  }
}
