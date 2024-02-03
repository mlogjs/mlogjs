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

      // const values = getPrintValues(scope, args).filter(
      //   value =>
      //     !(value instanceof LiteralValue) ||
      //     !value.isString() ||
      //     value.data.length > 0,
      // );

      if (!needsFormatString(values)) {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
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

function getPrintValues(scope: IScope, args: IValue[]) {
  const first = args[0];
  if (!isTemplateObjectArray(first)) {
    return args;
  }
  const values = [];

  const rest = args.slice(1);

  // the number of strings in the template object array
  // is always one more than the number of values

  // this loop intercalates the values and the strings
  // into the values array
  for (let i = 0; i <= rest.length; i++) {
    const [string] = first.get(
      c,
      new LiteralValue(i),
    ) as TValueInstructions<LiteralValue<string>>;
    values.push(string);
    if (i < rest.length) values.push(rest[i]);
  }

  return values;
}

function needsFormatString(values: IValue[]) {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!(value instanceof LiteralValue)) continue;
    if (!value.isString() || value.data.length > 0) return true;
  }
  return false;
}
