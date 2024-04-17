import { LiteralValue } from "../values";
import { IValue } from "../types";
import { MacroFunction } from "./Function";
import { CompilerError } from "../CompilerError";
import { isTemplateObjectArray } from "../utils";

export class Concat extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      const values = args.map(arg => c.getValue(arg)!);
      const [first] = values;

      if (!isTemplateObjectArray(c, first)) {
        assertLiterals(values, "Concat arguments must be all literal values");
        let text = "";
        for (const value of values) text += value.data;

        return c.registerValue(new LiteralValue(text));
      }

      let text = "";

      const [, ...interpolated] = values;
      assertLiterals(
        interpolated,
        "Interpolated values in concat must be literals",
      );

      for (let i = 0; i < values.length; i++) {
        const stringId = first.data[i];
        const string = c.getValue(stringId) as LiteralValue;

        text += string.data;
        if (i < interpolated.length) text += interpolated[i].data;
      }

      return c.registerValue(new LiteralValue(text));
    });
  }
}

function assertLiterals(
  values: IValue[],
  message: string,
): asserts values is LiteralValue[] {
  for (const value of values) {
    if (!(value instanceof LiteralValue)) throw new CompilerError(message);
  }
}
