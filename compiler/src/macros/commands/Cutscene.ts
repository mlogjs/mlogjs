import { assertLiteralOneOf } from "../../assertions/literals";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import { MacroFunction } from "../Function";

const validLengths = [1, 2, 4];

const validModes = ["pan", "zoom", "stop"];
export class Cutscene extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (!validLengths.includes(args.length))
        throw new CompilerError(
          `Expected 1, 2 or 4 arguments, recevied: ${args.length}`
        );

      const [mode] = args;

      assertLiteralOneOf(mode, validModes, "The cutscene mode");

      const params: (IValue | string)[] = ["zoom", "100", "100", "0.06", "0"];

      switch (mode.data) {
        case "pan":
          params[1] = args[1]; // x
          params[2] = args[2]; // y
          params[3] = args[3]; // speed
          break;
        case "zoom":
          params[1] = args[1]; // level
      }

      return [null, [new InstructionBase("cutscene", mode.data, ...params)]];
    });
  }
}
