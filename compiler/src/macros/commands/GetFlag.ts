import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class GetFlag extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, flag => {
      const result = new StoreValue(scope);
      return [result, [new InstructionBase("getflag", result, flag)]];
    });
  }
}
