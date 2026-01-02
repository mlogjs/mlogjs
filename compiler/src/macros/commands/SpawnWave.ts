import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";
import { filterIds } from "../util";

export class SpawnWave extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      const [natural, x, y] = args;

      cursor.addInstruction(
        new NativeInstruction(
          ["spawnwave", x ?? "0", y ?? "0", natural],
          filterIds([x, y]),
          [],
          loc,
        ),
      );

      return c.nullId;
    });
  }
}
