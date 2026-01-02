import { ICompilerContext } from "../../CompilerContext";
import { NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class SetBlock extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        floor: { args: ["x", "y", "to"] },
        ore: { args: ["x", "y", "to"] },
        block: {
          named: "options",
          args: ["x", "y", "to", "team", { key: "rotation", default: "0" }],
        },
      },
      handler(c, overload, cursor, loc, x, y, to, team, rotation) {
        cursor.addInstruction(
          new NativeInstruction(
            [
              "setblock",
              overload,
              to,
              x,
              y,
              team ?? "@derelict",
              rotation ?? "0",
            ],
            filterIds([x, y, to, team, rotation]),
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
