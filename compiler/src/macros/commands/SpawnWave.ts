import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { nullId } from "../../utils";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnWave extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      const [natural, x, y] = args;

      cursor.addInstruction(
        new NativeInstruction(
          ["spawnwave", x ?? "0", y ?? "0", natural],
          [x, y].filter(Boolean),
          [],
          loc,
        ),
      );

      return nullId;
    });
  }
}
