import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Cutscene extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      scope,
      overloads: {
        pan: { named: "options", args: ["x", "y", "speed"] },
        zoom: { args: ["level"] },
        stop: { args: [] },
      },
      handler(overload, ...args) {
        const params = Object.assign(["100", "100", "0.06", "0"], args);
        return [null, [new InstructionBase("cutscene", overload, ...params)]];
      },
    });
    super(scope, data);
  }
}
