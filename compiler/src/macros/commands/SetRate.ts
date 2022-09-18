import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

export class SetRate extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, ipt => [null, [new InstructionBase("setrate", ipt)]]);
  }
}
