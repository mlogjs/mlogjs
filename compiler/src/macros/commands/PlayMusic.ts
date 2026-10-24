import { InstructionBase } from "../../instructions";
import { assertIsRuntimeValue } from "../../utils";
import { MacroFunction } from "../Function";

export class PlayMusic extends MacroFunction<null> {
  constructor() {
    super((scope, out, name, interrupt) => {
      assertIsRuntimeValue(name, "name");

      return [
        null,
        [new InstructionBase("playmusic", name, interrupt ?? "true")],
      ];
    });
  }
}
