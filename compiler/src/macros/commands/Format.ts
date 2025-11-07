import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class Format extends MacroFunction<null> {
  constructor() {
    super((scope, out, value) => {
      return [null, [new InstructionBase("format", value)]];
    });
  }
}
