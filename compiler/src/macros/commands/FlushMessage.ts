import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { ObjectValue, StoreValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class FlushMessage extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        notify: { args: [] },
        mission: { args: [] },
        announce: { args: ["duration"] },
        toast: { args: ["duration"] },
        notifySync: { args: [] },
        missionSync: { args: [] },
        announceSync: { args: ["duration"] },
        toastSync: { args: ["duration"] },
      },
      handler(scope, overload, out, duration) {
        let result: IValue | null = null;
        let arg: IValue | string = "0";

        switch (overload) {
          case "announce":
          case "toast":
          case "mission":
          case "notify":
            result = StoreValue.from(scope, out);
            arg = result;
            break;
          case "announceSync":
          case "missionSync":
          case "toastSync":
          case "notifySync":
            result = null;
            arg = "@wait";
            break;
        }
        return [
          result,
          [new InstructionBase("message", overload, duration, arg)],
        ];
      },
    });
    super(data);
  }
}
