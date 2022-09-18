import { assertLiteralOneOf } from "../../assertions";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { SenseableValue, StoreValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = ["floor", "ore", "block", "building"] as const;

export class GetBlock extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 3) {
        throw new CompilerError(
          `Expected 3 arguments, received ${args.length}`
        );
      }
      const [kind, x, y] = args;

      assertLiteralOneOf(kind, validKinds, "The getBlock kind");

      const output =
        kind.data === "building"
          ? new SenseableValue(scope)
          : new StoreValue(scope);

      return [
        output,
        [new InstructionBase("getblock", kind.data, output, x, y)],
      ];
    });
  }
}
