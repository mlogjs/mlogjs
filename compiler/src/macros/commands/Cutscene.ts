import { InstructionBase } from "../../instructions";
import { ObjectValue, StoreValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Cutscene extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        pan: { named: "options", args: ["x", "y", "speed"] },
        zoom: { args: ["level"] },
        stop: { args: [] },
        active: { args: [] },
        shake: { args: ["amount", "duration"] },
        getHud: { args: [] },
        setHud: { args: ["shown"] },
      },
      handler(scope, overload, out, ...args) {
        if (overload === "active" || overload === "getHud") {
          const result = StoreValue.from(scope, out);
          return [
            result,
            [new InstructionBase("cutscene", overload, result, "0", "0", "0")],
          ];
        }
        const params = Object.assign(["100", "100", "0.06", "0"], args);
        return [null, [new InstructionBase("cutscene", overload, ...params)]];
      },
    });
    super(data);
  }
}
