import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class Sync extends MacroFunction<null> {
  constructor() {
    super((scope, out, variable) => {
      if (!variable) throw new CompilerError("Missing argument: variable");
      if (!(variable instanceof StoreValue))
        throw new CompilerError(
          `Expected a store value, received [${variable.debugString()}]`,
        );
      return [null, [new InstructionBase("sync", variable)]];
    });
  }
}
