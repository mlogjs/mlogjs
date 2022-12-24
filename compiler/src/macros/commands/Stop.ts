import { InstructionBase } from "../../instructions";
import { EInstIntent } from "../../types";
import { assign } from "../../utils";
import { MacroFunction } from "../Function";

export class Stop extends MacroFunction<null> {
  constructor() {
    super(() => [
      null,
      [
        assign(new InstructionBase("stop"), {
          intent: EInstIntent.exit,
        }),
      ],
    ]);
  }
}
