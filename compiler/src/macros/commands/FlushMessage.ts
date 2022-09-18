import { assertLiteralOneOf } from "../../assertions/literals";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { MacroFunction } from "../Function";

const validKinds = ["notify", "mission", "announce", "toast"] as const;

export class FlushMessage extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 1 && args.length !== 2) {
        throw new CompilerError(
          `Expected 1-2 arguments, received ${args.length}`
        );
      }

      const [kind, duration] = args;

      assertLiteralOneOf(kind, validKinds, "The flush message kind");

      return [null, [new InstructionBase("message", kind.data, duration)]];
    });
  }
}
