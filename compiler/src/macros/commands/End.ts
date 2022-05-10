import { EndInstruction } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

export class End extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, () => [null, [new EndInstruction()]]);
  }
}
