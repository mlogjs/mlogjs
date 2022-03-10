import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IInstruction, IScope, IValue } from "../../types";

export class Print extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...values: IValue[]) => {
      const inst: IInstruction[] = [];

      for (const value of values) {
        inst.push(new InstructionBase("print", value));
      }

      return [null, inst];
    });
  }
}
