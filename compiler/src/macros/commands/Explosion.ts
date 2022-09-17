import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

export class Explosion extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 8)
        throw new CompilerError(
          `Expected 8 arguments, received ${args.length}`
        );

      return [null, [new InstructionBase("explosion", ...args)]];
    });
  }
}
