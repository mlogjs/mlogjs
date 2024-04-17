import { MacroFunction } from "..";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { nullId } from "../../utils";
import { NativeInstruction } from "../../flow";

export class Wait extends MacroFunction {
  constructor() {
    super((c, cursor, loc, secondsId) => {
      const seconds = c.getValue(secondsId);

      if (
        !(seconds instanceof StoreValue) &&
        !(seconds instanceof LiteralValue && seconds.isNumber())
      )
        throw new CompilerError(
          "The wait seconds must be either a number literal or a store",
        );

      cursor.addInstruction(
        new NativeInstruction(["wait", secondsId], [secondsId], [], loc),
      );
      return nullId;
    });
  }
}
