import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class Stop extends MacroFunction<null> {
  constructor() {
    super(() => [null, [new InstructionBase("stop")]]);
  }
}
