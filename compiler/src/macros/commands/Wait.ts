import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class Wait extends MacroFunction<null> {
  constructor() {
    super((scope, out, seconds) => {
      if (
        !(seconds instanceof StoreValue) &&
        !(seconds instanceof LiteralValue && seconds.isNumber())
      )
        throw new CompilerError(
          "The wait seconds must be either a number literal or a store"
        );

      return [null, [new InstructionBase("wait", seconds)]];
    });
  }
}
