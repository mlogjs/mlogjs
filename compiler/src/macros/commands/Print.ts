import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IInstruction, IScope, IValue, TValueInstructions } from "../../types";
import { LiteralValue } from "../../values";
import { isTemplateObjectArray } from "../../utils";

export class Print extends MacroFunction<null> {
  constructor() {
    super((scope, out, ...args: IValue[]) => {
      const inst: IInstruction[] = [];

      const values = getPrintValues(scope, args).filter(
        value =>
          !(value instanceof LiteralValue) ||
          !value.isString() ||
          value.data.length > 0,
      );

      let start = 0;

      do {
        const end = getChunkEnd(values, start);

        if (!needsFormatString(values, start, end)) {
          for (let i = start; i < end; i++) {
            const value = values[i];
            inst.push(new InstructionBase("print", value));
          }
        } else {
          let counter = 0;
          let formatString = "";
          for (let i = start; i < end; i++) {
            const value = values[i];
            if (value instanceof LiteralValue) {
              formatString += value.data;
            } else {
              formatString += `{${counter}}`;
              counter++;
            }
          }
          inst.push(
            new InstructionBase("print", new LiteralValue(formatString)),
          );
          for (let i = start; i < end; i++) {
            const value = values[i];
            if (value instanceof LiteralValue) continue;
            inst.push(new InstructionBase("format", value));
          }
        }

        start = end;
      } while (start < values.length);

      return [null, inst];
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
      scope,
      new LiteralValue(i),
    ) as TValueInstructions<LiteralValue<string>>;
    values.push(string);
    if (i < rest.length) values.push(rest[i]);
  }

  return values;
}

function needsFormatString(values: IValue[], start: number, end: number) {
  for (let i = start; i < end; i++) {
    const value = values[i];
    if (!(value instanceof LiteralValue)) continue;
    if (!value.isString() || value.data.length > 0) return true;
  }
  return false;
}

function getChunkEnd(values: IValue[], start: number) {
  let end = start;
  for (let counter = 0; end < values.length && counter <= 10; end++) {
    const value = values[end];

    // this arrangement allows us to still append literal
    // values to the chunk even if we already have 10
    // pending interpalations
    if (value instanceof LiteralValue) continue;
    if (counter >= 10) break;
    counter++;
  }
  return end;
}
