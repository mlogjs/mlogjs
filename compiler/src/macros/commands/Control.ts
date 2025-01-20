import { ICompilerContext } from "../../CompilerContext";
import { NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class Control extends ObjectValue {
  constructor(c: ICompilerContext) {
    super(
      createOverloadNamespace({
        c,
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
        handler(c, overload, cursor, loc, ...args) {
          const params = ["control", overload, ...args];
          const inputs = filterIds(args);
          cursor.addInstruction(new NativeInstruction(params, inputs, [], loc));
          return c.nullId;
        },
      }),
    );
  }
}
