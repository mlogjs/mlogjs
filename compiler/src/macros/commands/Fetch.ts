import { InstructionBase } from "../../instructions";
import { EMutability, IValue } from "../../types";
import { ObjectValue, SenseableValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Fetch extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
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
      handler(scope, overload, out, team, ...rest) {
        const output = SenseableValue.from(scope, out, EMutability.constant);

        const params: (IValue | string)[] = ["0", "@conveyor"];

        if (overload === "buildCount") {
          params[1] = rest[0];
        } else {
          Object.assign(params, rest);
        }

        return [
          output,
          [new InstructionBase("fetch", overload, output, team, ...params)],
        ];
      },
    });
    super(data);
  }
}
