import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

export class SpawnWave extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (natural, x, y) => [
      null,
      [new InstructionBase("spawnwave", x ?? "10", y ?? "10", natural)],
    ]);
  }
}
