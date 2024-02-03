import { InstructionBase } from "../../instructions";
import { IInstruction, IValue } from "../../types";
import { LiteralValue } from "../../values";
import { isTemplateObjectArray } from "../../utils";
import { ImmutableId } from "../../flow";
import { MacroFunction } from "../Function";

export class Print extends MacroFunction<null> {
  constructor() {
    super((c, out, ...values: IValue[]) => {
      const [first] = values;
      const inst: IInstruction[] = [];

      if (!isTemplateObjectArray(first)) {
        for (const value of values) {
          inst.push(new InstructionBase("print", value));
        }

        return inst;
      }

      // `first` is likely a template strings array
      // maybe this should be checked in another way?
      const { length } = first.data;

      for (let i = 1; i < values.length; i++) {
        const id = new ImmutableId();
        first.get(c, new LiteralValue(i - 1), id);
        const string = c.getValue(id) as LiteralValue<string>;

        if (string.data) inst.push(new InstructionBase("print", string));
        inst.push(new InstructionBase("print", values[i]));
      }

      const tailId = new ImmutableId();
      first.get(c, new LiteralValue(length.data - 1), tailId);
      const tail = c.getValue(tailId) as LiteralValue<string>;
      if (tail.data) inst.push(new InstructionBase("print", tail));
      return inst;
    });
  }
}
