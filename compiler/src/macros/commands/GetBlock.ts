import { InstructionBase } from "../../instructions";
import { ObjectValue, StoreValue } from "../../values";
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
      handler(scope, overload, out, x, y) {
        const output = StoreValue.from(scope, out);

        return [
          output,
          [new InstructionBase("getblock", overload, output, x, y)],
        ];
      },
    });
    super(data);
  }
}
