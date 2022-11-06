import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class FlushMessage extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        notify: { args: [] },
        mission: { args: [] },
        announce: { args: ["duration"] },
        toast: { args: ["duration"] },
      },
      handler(scope, overload, out, duration) {
        return [null, [new InstructionBase("message", overload, duration)]];
      },
    });
    super(data);
  }
}
