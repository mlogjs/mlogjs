import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { LiteralValue, SenseableValue } from "../../values";
import { CompilerError } from "../../CompilerError";

const validKinds = ["enabled", "shoot", "shootp", "config", "color"];
export class Control extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (kind, building, ...args) => {
      if (!(kind instanceof LiteralValue) || typeof kind.data !== "string")
        throw new CompilerError("The control kind must be a string literal");

      if (!validKinds.includes(kind.data))
        throw new CompilerError("Invalid control kind");

      if (!(building instanceof SenseableValue))
        throw new CompilerError("The building must be a senseable value");

      return [
        null,
        [new InstructionBase("control", kind.data, building, ...args)],
      ];
    });
  }
}
