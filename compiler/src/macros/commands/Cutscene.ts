import { ICompilerContext } from "../../CompilerContext";
import { NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class Cutscene extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        pan: { named: "options", args: ["x", "y", "speed"] },
        zoom: { args: ["level"] },
        stop: { args: [] },
      },
      handler(c, overload, cursor, loc, ...args) {
        const params = Object.assign(["100", "100", "0.06", "0"], args);

        cursor.addInstruction(
          new NativeInstruction(
            ["cutscene", overload, ...params],
            filterIds(args),
            [],
            loc,
          ),
        );

        return c.nullId;
      },
    });
    super(data);
  }
}
