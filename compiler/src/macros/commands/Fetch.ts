import { ICompilerContext } from "../../CompilerContext";
import { ImmutableId, NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

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
      handler(c, overload, cursor, loc, team, ...rest) {
        const output = c.createImmutableId();

        const params: (ImmutableId | string)[] = ["0", "@conveyor"];

        if (overload === "buildCount") {
          params[1] = rest[0];
        } else {
          Object.assign(params, rest);
        }

        cursor.addInstruction(
          new NativeInstruction(
            ["fetch", overload, output, team, ...params],
            filterIds([team, ...rest]),
            [output],
            loc,
          ),
        );

        return c.nullId;
      },
    });
    super(data);
  }
}
