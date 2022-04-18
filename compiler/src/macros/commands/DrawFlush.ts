import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { SenseableValue } from "../../values";
import { CompilerError } from "../../CompilerError";

export class DrawFlush extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (target: IValue) => {
      if (!(target instanceof SenseableValue))
        throw new CompilerError(
          "The drawflush target must be a senseable value"
        );
      return [null, [new InstructionBase("drawflush", target)]];
    });
  }
}
