import { ICompilerContext } from "../../CompilerContext";
import { InstructionBase } from "../../instructions";
import { nullId } from "../../utils";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

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
      handler(c, overload, out, x, y, to, team, rotation) {
        c.setAlias(out, nullId);
        return [
          new InstructionBase(
            "setblock",
            overload,
            to,
            x,
            y,
            team ?? "@derelict",
            rotation ?? "0",
          ),
        ];
      },
    });
    super(data);
  }
}
