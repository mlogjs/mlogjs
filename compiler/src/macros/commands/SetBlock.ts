import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = ["ore", "floor", "block"];

export class SetBlock extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 4 && args.length !== 6) {
        throw new CompilerError(
          `Expected 4 or 6 arguments, received ${args.length}`
        );
      }
      const [kind, x, y, to, team, rotation] = args;

      if (
        !(kind instanceof LiteralValue) ||
        typeof kind.data !== "string" ||
        !validKinds.includes(kind.data)
      )
        throw new CompilerError(
          'The kind must be either "ore", "floor" or "block"'
        );

      return [
        null,
        [
          new InstructionBase(
            "setblock",
            kind.data,
            to,
            x,
            y,
            team ?? "@delerict",
            rotation ?? "0"
          ),
        ],
      ];
    });
  }
}
