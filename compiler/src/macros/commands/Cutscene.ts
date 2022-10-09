import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Cutscene extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        pan: { named: "options", args: ["x", "y", "speed"] },
        zoom: { args: ["level"] },
        stop: { args: [] },
      },
      handler(scope, overload, ...args) {
        const params = Object.assign(["100", "100", "0.06", "0"], args);
        return [null, [new InstructionBase("cutscene", overload, ...params)]];
      },
    });
    super(data);
  }
}
