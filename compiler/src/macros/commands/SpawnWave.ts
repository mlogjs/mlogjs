import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { nullId } from "../../utils";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnWave extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      const natural = c.getValue(args[0]);
      const naturalId = args[0];
      const xId = args[1];
      const yId = args[2];

      if (
        !(natural instanceof LiteralValue) ||
        (natural.data !== 1 && natural.data !== 0)
      )
        throw new CompilerError(
          "The 'natural' argument must be a boolean literal",
          loc,
        );

      cursor.addInstruction(
        new NativeInstruction(
          ["spawnwave", xId ?? "0", yId ?? "0", naturalId],
          [],
          [],
          loc,
        ),
      );

      return nullId;
    });
  }
}
