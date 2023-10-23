import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class Sync extends MacroFunction<null> {
  constructor() {
    super((scope, out, value) => {
      return [null, [new InstructionBase("sync", value)]];
    });
  }
}
