import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import { ObjectValue, SenseableValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Fetch extends ObjectValue {
  constructor(scope: IScope) {
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
      handler(scope, overload, team, ...rest) {
        const output = new SenseableValue(scope);

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
    super(scope, data);
  }
}
