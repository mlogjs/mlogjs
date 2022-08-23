import { CompilerError } from "../CompilerError";
import { ZeroSpaceInstruction } from "../instructions";
import { IScope, IValue } from "../types";
import { isTemplateObjectArray } from "../utils";
import { LiteralValue } from "../values";
import { MacroFunction } from "./Function";

export class Asm extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (stringsArray, ...values) => {
      if (!isTemplateObjectArray(stringsArray))
        throw new CompilerError("Expected to receive a template strings array");

      const args: (string | IValue)[] = [];

      for (let i = 0; i < values.length; i++) {
        const [item] = stringsArray.get(scope, new LiteralValue(scope, i)) as [
          LiteralValue,
          never
        ];

        args.push(item.data as string);
        args.push(values[i]);
      }

      const { length } = stringsArray.data;

      const [tail] = stringsArray.get(
        scope,
        new LiteralValue(scope, length.data - 1)
      ) as [LiteralValue, never];
      args.push(tail.data as string);
      return [null, [new ZeroSpaceInstruction(...args)]];
    });
  }
}
