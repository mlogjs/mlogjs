import { ICompilerContext } from "../../CompilerContext";
import { CompilerError } from "../../CompilerError";
import { ImmutableId, NativeInstruction } from "../../flow";
import { assertLiteralOneOf } from "../../utils";
import { LiteralValue, ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

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
      handler(scope, overload, cursor, loc, effectId, ...args) {
        const effect = c.getValue(effectId as ImmutableId);
        if (!(effect instanceof LiteralValue))
          throw new CompilerError("The status effect must be a string literal");
        assertLiteralOneOf(effect, validEffects, "The status effect");

        cursor.addInstruction(
          new NativeInstruction(
            ["status", String(overload !== "apply"), effect.data, ...args],
            filterIds(args),
            [],
            loc,
          ),
        );

        return c.nullId;
      },
    });
    super(data);
  }
}
