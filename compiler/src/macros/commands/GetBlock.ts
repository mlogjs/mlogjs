import { InstructionBase } from "../../instructions";
import { EMutability } from "../../types";
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
      handler(scope, overload, out, x, y) {
        const output =
          overload === "building"
            ? SenseableValue.out(scope, out, EMutability.constant)
            : StoreValue.out(scope, out, EMutability.constant);

        return [
          output,
          [new InstructionBase("getblock", overload, output, x, y)],
        ];
      },
    });
    super(data);
  }
}
