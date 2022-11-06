import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnWave extends MacroFunction<null> {
  constructor() {
    super((scope, out, natural, x, y) => {
      if (
        !(natural instanceof LiteralValue) ||
        (natural.data !== 1 && natural.data !== 0)
      )
        throw new CompilerError(
          "The 'natural' argument must be a boolean literal"
        );
      return [
        null,
        [
          new InstructionBase(
            "spawnwave",
            x ?? "10",
            y ?? "10",
            String(!!natural.data)
          ),
        ],
      ];
    });
  }
}
