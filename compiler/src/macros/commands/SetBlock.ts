import { assertLiteralOneOf } from "../../assertions/literals";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

const validKinds = ["ore", "floor", "block"] as const;

export class SetBlock extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 4 && args.length !== 6) {
        throw new CompilerError(
          `Expected 4 or 6 arguments, received ${args.length}`
        );
      }
      const [kind, x, y, to, team, rotation] = args;

      assertLiteralOneOf(kind, validKinds, "The setBlock kind");

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
