import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { LiteralValue, SenseableValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = [
  "unit",
  "unitCount",
  "player",
  "playerCount",
  "core",
  "coreCount",
  "build",
  "buildCount",
];

export class Fetch extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      // 2 to 4 parameters
      if (args.length < 2 || args.length > 4) {
        throw new CompilerError(
          `Expected 2 to 4 arguments, received ${args.length}`
        );
      }

      const [kind, team] = args;
      if (!(kind instanceof LiteralValue) || typeof kind.data !== "string") {
        throw new CompilerError(`The fetch kind must be a string literal`);
      }

      if (!validKinds.includes(kind.data))
        throw new CompilerError(`Invalid fetch kind: "${kind.data}"`);

      const output = new SenseableValue(scope);
      const params = [kind.data, output, team, "0", "@conveyor"];

      if (kind.data === "buildCount") {
        const [, , block] = args;
        params[4] = block;
      } else {
        if (args[2]) params[3] = args[2];
        if (args[3]) params[4] = args[3];
      }

      return [output, [new InstructionBase("fetch", ...params)]];
    });
  }
}
