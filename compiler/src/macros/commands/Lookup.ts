import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { createTemp } from "../../utils";

const validKinds = ["block", "unit", "item", "liquid"];
export class Lookup extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (kind, index) => {
      if (!(kind instanceof LiteralValue && typeof kind.data === "string"))
        throw new CompilerError("The lookup kind must be a string literal");

      if (!validKinds.includes(kind.data))
        throw new CompilerError("Invalid lookup kind");

      if (
        !(index instanceof LiteralValue && typeof index.data === "number") &&
        !(index instanceof StoreValue)
      )
        throw new CompilerError(
          "The lookup index must be a number literal or a store"
        );

      const temp = createTemp(scope);
      return [temp, [new InstructionBase("lookup", kind.data, temp, index)]];
    });
  }
}
