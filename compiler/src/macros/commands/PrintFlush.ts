import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { ObjectValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class PrintFlush extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (target: IValue) => {
      if (!(target instanceof ObjectValue))
        throw new CompilerError("The printflush target must be a building");
      return [null, [new InstructionBase("printflush", target)]];
    });
  }
}
