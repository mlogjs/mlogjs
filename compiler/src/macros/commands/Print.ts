import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";

export class Print extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (...values: IValue[]) => {
      return [null, [new InstructionBase("print", ...values)]];
    });
  }
}
