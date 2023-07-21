import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IValue } from "../../types";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class GetLink extends MacroFunction {
  constructor() {
    super((scope, out, index: IValue) => {
      if (
        !(index instanceof StoreValue) &&
        (!(index instanceof LiteralValue) || !index.isNumber())
      )
        throw new CompilerError(
          "The getlink index must be a number literal or a store",
        );
      const outBuild = StoreValue.from(scope, out);
      return [outBuild, [new InstructionBase("getlink", outBuild, index)]];
    });
  }
}
