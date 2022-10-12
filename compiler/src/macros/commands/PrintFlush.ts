import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IValue } from "../../types";
import { SenseableValue } from "../../values";
import { CompilerError } from "../../CompilerError";

const defaultTargetName = "message1";
export class PrintFlush extends MacroFunction<null> {
  constructor() {
    super((scope, target?: IValue) => {
      if (!target)
        return [null, [new InstructionBase("printflush", defaultTargetName)]];

      if (!(target instanceof SenseableValue))
        throw new CompilerError(
          "The printflush target must be a senseable value"
        );
      return [null, [new InstructionBase("printflush", target)]];
    });
  }
}
