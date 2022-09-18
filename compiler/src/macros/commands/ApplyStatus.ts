import { assertLiteralOneOf } from "../../assertions";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

const validKinds = ["apply", "clear"] as const;

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

export class ApplyStatus extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 3 && args.length !== 4)
        throw new CompilerError(
          `Expected 3 or 4 arguments, received ${args.length}`
        );
      const [kind, effect, unit, duration] = args;

      assertLiteralOneOf(kind, validKinds, "The kind");

      assertLiteralOneOf(effect, validEffects, "The status effect");

      return [
        null,
        [
          new InstructionBase(
            "status",
            String(kind.data !== "apply"),
            effect.data,
            unit,
            duration ?? "10"
          ),
        ],
      ];
    });
  }
}
