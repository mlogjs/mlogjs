import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, StoreValue } from "../../values";

const validKinds = ["enabled", "shoot", "shootp", "config", "color"];
export class Control extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (kind, building, ...args) => {
      if (!(kind instanceof LiteralValue) || typeof kind.data !== "string")
        throw new Error("The control kind must be a string literal");

      if (!validKinds.includes(kind.data))
        throw new Error("Invalid control kind");

      if (!(building instanceof StoreValue))
        throw new Error("The building must be a store");

      return [
        null,
        [new InstructionBase("control", kind.data, building, ...args)],
      ];
    });
  }
}
