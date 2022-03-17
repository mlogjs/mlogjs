import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class Wait extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, seconds => {
      if (
        !(seconds instanceof StoreValue) &&
        !(seconds instanceof LiteralValue && typeof seconds.data === "number")
      )
        throw new CompilerError(
          "The wait seconds must be either a number literal or a store"
        );

      return [null, [new InstructionBase("wait", seconds)]];
    });
  }
}
