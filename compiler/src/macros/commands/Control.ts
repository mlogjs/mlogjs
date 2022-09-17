import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { SenseableValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { assertLiteralOneOf } from "../../assertions/literals";

const validKinds = ["enabled", "shoot", "shootp", "config", "color"] as const;
export class Control extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (kind, building, ...args) => {
      assertLiteralOneOf(kind, validKinds, "The control kind");

      if (!(building instanceof SenseableValue))
        throw new CompilerError("The building must be a senseable value");

      return [
        null,
        [new InstructionBase("control", kind.data, building, ...args)],
      ];
    });
  }
}
