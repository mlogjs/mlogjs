import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { ObjectValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class DrawFlush extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (target: IValue) => {
      if (!(target instanceof ObjectValue))
        throw new CompilerError("The drawflush target must be a building");
      return [null, [new InstructionBase("drawflush", target)]];
    });
  }
}
