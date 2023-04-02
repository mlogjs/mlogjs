import { CompilerError } from "../CompilerError";
import { EMutability, IValue } from "../types";
import { LiteralValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

export class GetGlobal extends MacroFunction {
  constructor(mutability: EMutability) {
    super((scope, out, name: IValue) => {
      if (!(name instanceof LiteralValue) || !name.isString())
        throw new CompilerError("The name parameter must be a string literal.");

      const result = new StoreValue(name.data, mutability);

      return [result, []];
    });
  }
}
