import { InstructionBase } from "../../instructions";
import { ObjectValue, StoreValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Lookup extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        block: { args: ["index"] },
        unit: { args: ["index"] },
        item: { args: ["index"] },
        liquid: { args: ["index"] },
      },
      handler(scope, overload, index) {
        const output = new StoreValue(scope);
        return [
          output,
          [new InstructionBase("lookup", overload, output, index)],
        ];
      },
    });
    super(data);
  }
}
