import { LiteralValue } from "../../values";
import { isTemplateObjectArray, nullId } from "../../utils";
import { NativePrintInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class Print extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...values) => {
      const first = c.getValue(values[0]);

      if (!isTemplateObjectArray(c, first)) {
        for (const value of values) {
          cursor.addInstruction(new NativePrintInstruction(value, loc));
        }
        return nullId;
      }

      // `first` is likely a template strings array
      // maybe this should be checked in another way?
      const { length } = first.data;

      for (let i = 1; i < values.length; i++) {
        const id = first.data[i - 1];
        const string = c.getValue(id) as LiteralValue<string>;

        if (string.data)
          cursor.addInstruction(new NativePrintInstruction(id, loc));
        cursor.addInstruction(new NativePrintInstruction(values[i], loc));
      }

      const tailId = first.data[length.data - 1];

      const tail = c.getValue(tailId) as LiteralValue<string>;
      if (tail.data)
        cursor.addInstruction(new NativePrintInstruction(tailId, loc));

      return nullId;
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
    const [string] = first.get(c, new LiteralValue(i)) as TValueInstructions<
      LiteralValue<string>
    >;
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
