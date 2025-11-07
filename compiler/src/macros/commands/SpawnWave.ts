import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class SpawnWave extends MacroFunction<null> {
  constructor() {
    super((scope, out, natural, x, y) => {
      return [
        null,
        [new InstructionBase("spawnwave", x ?? "null", y ?? "null", natural)],
      ];
    });
  }
}
