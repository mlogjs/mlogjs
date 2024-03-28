import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class LocalePrint extends MacroFunction<null> {
  constructor() {
    super((scope, out, name) => {
      return [null, [new InstructionBase("localeprint", name)]];
    });
  }
}
