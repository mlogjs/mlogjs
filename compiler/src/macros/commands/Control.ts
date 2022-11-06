import { InstructionBase } from "../../instructions";
import { ObjectValue, StoreValue } from "../../values";
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
          color: { args: ["building", "r", "g", "b"] },
        },
        handler(scope, overload, out, ...args) {
          if (overload !== "color")
            return [null, [new InstructionBase("control", overload, ...args)]];

          const temp = StoreValue.from(scope);
          // this "patch" is here for compatibility reasons
          // I don't want to add another breaking change
          // TODO: figure out if this patch should be removed later
          const [building, ...colors] = args;
          return [
            null,
            [
              new InstructionBase("packcolor", temp, ...colors),
              new InstructionBase("control", overload, building, temp),
            ],
          ];
        },
      })
    );
  }
}
