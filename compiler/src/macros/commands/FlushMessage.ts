import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = ["notify", "mission", "announce", "toast"];

export class FlushMessage extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 1 && args.length !== 2) {
        throw new CompilerError(
          `Expected 1-2 arguments, received ${args.length}`
        );
      }

      const [kind, duration] = args;

      if (!(kind instanceof LiteralValue) || typeof kind.data !== "string") {
        throw new CompilerError("The kind must be a string literal");
      }

      if (!validKinds.includes(kind.data)) {
        throw new CompilerError(
          `The kind must be one of ${validKinds
            .slice(0, -1)
            .map(value => `"${value}"`)} or ${
            validKinds[validKinds.length - 1]
          }`
        );
      }

      return [null, [new InstructionBase("message", kind.data, duration)]];
    });
  }
}
