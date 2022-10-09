import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class FlushMessage extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      overloads: {
        notify: { args: [] },
        mission: { args: [] },
        announce: { args: ["duration"] },
        toast: { args: ["duration"] },
      },
      handler(scope, overload, duration) {
        return [null, [new InstructionBase("message", overload, duration)]];
      },
    });
    super(scope, data);
  }
}
