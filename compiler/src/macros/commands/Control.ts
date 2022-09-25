import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Control extends ObjectValue {
  constructor(scope: IScope) {
    super(
      scope,
      createOverloadNamespace({
        scope,
        overloads: {
          enabled: { args: ["building", "value"] },
          shoot: {
            named: "options",
            args: ["building", "x", "y", "shoot"],
          },
          shootp: {
            named: "options",
            args: ["building", "unit", "shoot"],
          },
          config: { args: ["building", "value"] },
          color: { args: ["building", "r", "g", "b"] },
        },
        handler(overload, ...args) {
          return [null, [new InstructionBase("control", overload, ...args)]];
        },
      })
    );
  }
}
