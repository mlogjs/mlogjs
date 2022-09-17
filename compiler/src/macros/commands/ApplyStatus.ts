import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = ["apply", "clear"];

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
];

export class ApplyStatus extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 3 && args.length !== 4)
        throw new CompilerError(
          `Expected 3 or 4 arguments, received ${args.length}`
        );
      const [kind, effect, unit, duration] = args;

      if (
        !(kind instanceof LiteralValue) ||
        typeof kind.data !== "string" ||
        !validKinds.includes(kind.data)
      )
        throw new CompilerError('The kind must be either "apply" or "clear"');

      if (
        !(effect instanceof LiteralValue) ||
        typeof effect.data !== "string" ||
        !validEffects.includes(effect.data)
      )
        throw new CompilerError("Invalid status effect");

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
