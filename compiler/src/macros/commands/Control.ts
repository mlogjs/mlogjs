import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Control extends ObjectValue {
  constructor() {
    super(
      createOverloadNamespace({
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
          color: { args: ["building", "rgbaData"] },
        },
        handler(scope, overload, out, ...args) {
          return [null, [new InstructionBase("control", overload, ...args)]];
        },
      })
    );
  }
}
