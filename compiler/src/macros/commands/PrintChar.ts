import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";

export class PrintChar extends MacroFunction<null> {
  constructor() {
    super((scope, out, character) => {
      return [null, [new InstructionBase("printchar", character)]];
    });
  }
}
