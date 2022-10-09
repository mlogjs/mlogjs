import { InstructionBase } from "../../instructions";
import { ObjectValue, SenseableValue, StoreValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class GetBlock extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        floor: { args: ["x", "y"] },
        ore: { args: ["x", "y"] },
        block: { args: ["x", "y"] },
        building: { args: ["x", "y"] },
      },
      handler(scope, overload, x, y) {
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
    super(data);
  }
}
