import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { ObjectValue, SenseableValue, StoreValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class GetBlock extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      scope,
      overloads: {
        floor: { args: ["x", "y"] },
        ore: { args: ["x", "y"] },
        block: { args: ["x", "y"] },
        building: { args: ["x", "y"] },
      },
      handler(overload, x, y) {
        const output =
          overload === "building"
            ? new SenseableValue(scope)
            : new StoreValue(scope);

        return [
          output,
          [new InstructionBase("getblock", overload, output, x, y)],
        ];
      },
    });
    super(scope, data);
  }
}
