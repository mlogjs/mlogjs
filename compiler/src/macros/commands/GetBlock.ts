import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { LiteralValue, SenseableValue, StoreValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = ["floor", "ore", "block", "building"];

export class GetBlock extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (args.length !== 3) {
        throw new CompilerError(
          `Expected 3 arguments, received ${args.length}`
        );
      }
      const [kind, x, y] = args;

      if (
        !(kind instanceof LiteralValue) ||
        typeof kind.data !== "string" ||
        !validKinds.includes(kind.data)
      ) {
        throw new CompilerError(
          `The kind must be one of: "floor", "ore", "block" or "building`
        );
      }

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
