import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class GetFlag extends MacroFunction {
  constructor() {
    super((c, out, flag) => {
      const result = c.getValueOrTemp(out);
      return [new InstructionBase("getflag", result, flag)];
    });
  }
}
