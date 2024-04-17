import { ICompilerContext } from "../../CompilerContext";
import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Fetch extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        unit: { args: ["team", "index"] },
        unitCount: { args: ["team"] },
        player: { args: ["team", "index"] },
        playerCount: { args: ["team"] },
        core: { args: ["team", "index"] },
        coreCount: { args: ["team"] },
        build: { args: ["team", "index", "block"] },
        buildCount: { args: ["team", "block"] },
      },
      handler(c, overload, out, team, ...rest) {
        const output = c.getValueOrTemp(out);

        const params: (IValue | string)[] = ["0", "@conveyor"];

        if (overload === "buildCount") {
          params[1] = rest[0];
        } else {
          Object.assign(params, rest);
        }

        return [
          new InstructionBase("fetch", overload, output, team, ...params),
        ];
      },
    });
    super(data);
  }
}
