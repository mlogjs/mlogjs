import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

export class Stop extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, () => [null, [new InstructionBase("stop")]]);
  }
}
