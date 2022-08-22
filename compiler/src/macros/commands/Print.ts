import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IInstruction, IScope, IValue } from "../../types";
import { LiteralValue } from "../../values";
import { isTemplateObjectArray } from "../../utils";

export class Print extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...values: IValue[]) => {
      const [first] = values;
      const inst: IInstruction[] = [];

      if (!isTemplateObjectArray(first)) {
        for (const value of values) {
          inst.push(new InstructionBase("print", value));
        }

        return [null, inst];
      }

      // `first` is likely a template strings array
      // maybe this should be checked in another way?
      const { length } = first.data;

      for (let i = 1; i < values.length; i++) {
        const [string] = first.get(scope, new LiteralValue(scope, i - 1));
        inst.push(new InstructionBase("print", string));
        inst.push(new InstructionBase("print", values[i]));
      }

      const [tail] = first.get(scope, new LiteralValue(scope, length.data - 1));

      inst.push(new InstructionBase("print", tail));
      return [null, inst];
    });
  }
}
