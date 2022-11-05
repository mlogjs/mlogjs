import { InstructionBase } from "../../instructions";
import { StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class GetFlag extends MacroFunction {
  constructor() {
    super((scope, out, flag) => {
      const result = StoreValue.from(scope, out);
      return [result, [new InstructionBase("getflag", result, flag)]];
    });
  }
}
