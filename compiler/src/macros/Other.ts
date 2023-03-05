import { LiteralValue } from "../values";
import { IValue, TValueInstructions } from "../types";
import { MacroFunction } from "./Function";
import { CompilerError } from "../CompilerError";
import { isTemplateObjectArray } from "../utils";

export class Concat extends MacroFunction {
  constructor() {
    super((scope, out, ...values: IValue[]) => {
      const [first] = values;
      if (!isTemplateObjectArray(first)) {
        assertLiterals(values, "Concat arguments must be all literal values");
        let text = "";
        for (const value of values) text += value.data;

        return [new LiteralValue(text), []];
      }

      let text = "";

      const [, ...interpolated] = values;
      assertLiterals(
        interpolated,
        "Interpolated values in concat must be literals"
      );

      for (let i = 0; i < values.length; i++) {
        const [string] = first.get(
          scope,
          new LiteralValue(i)
        ) as TValueInstructions<LiteralValue>;

        text += string.data;
        if (i < interpolated.length) text += interpolated[i].data;
      }

      return [new LiteralValue(text), []];
    });
  }
}

function assertLiterals(
  values: IValue[],
  message: string
): asserts values is LiteralValue[] {
  for (const value of values) {
    if (!(value instanceof LiteralValue)) throw new CompilerError(message);
  }
}
