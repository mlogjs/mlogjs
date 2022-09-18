import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { SenseableValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnUnit extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 4 && args.length !== 5)
        throw new CompilerError(
          `Expected 4 or 5 arguments, received ${args.length}`
        );

      const [type, x, y, team, rotation] = args;

      const output = new SenseableValue(scope);

      return [
        output,
        [
          new InstructionBase(
            "spawn",
            type,
            x,
            y,
            rotation ?? "0",
            team,
            output
          ),
        ],
      ];
    });
  }
}
