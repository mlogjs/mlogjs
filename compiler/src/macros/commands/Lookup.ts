import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { assertLiteralOneOf } from "../../assertions/literals";

const validKinds = ["block", "unit", "item", "liquid"] as const;

export class Lookup extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (kind, index) => {
      assertLiteralOneOf(kind, validKinds, "The lookup kind");

      if (
        !(index instanceof LiteralValue && typeof index.data === "number") &&
        !(index instanceof StoreValue)
      )
        throw new CompilerError(
          "The lookup index must be a number literal or a store"
        );

      const temp = new StoreValue(scope);
      return [temp, [new InstructionBase("lookup", kind.data, temp, index)]];
    });
  }
}
