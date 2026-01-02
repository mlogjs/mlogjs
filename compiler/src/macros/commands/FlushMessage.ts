import { ICompilerContext } from "../../CompilerContext";
import { ImmutableId, NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class FlushMessage extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
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
      handler(c, overload, cursor, loc, duration) {
        let result = c.nullId;
        let arg: ImmutableId | string = "0";

        switch (overload) {
          case "announce":
          case "toast":
          case "mission":
          case "notify":
            result = c.createImmutableId();
            arg = result;
            break;
          case "announceSync":
          case "missionSync":
          case "toastSync":
          case "notifySync":
            result = c.nullId;
            arg = "@wait";
            break;
        }

        cursor.addInstruction(
          new NativeInstruction(
            ["message", overload, duration, arg],
            filterIds([duration]),
            filterIds([arg]),
            loc,
          ),
        );

        return result;
      },
    });
    super(data);
  }
}
