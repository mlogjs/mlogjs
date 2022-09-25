import { InstructionBase } from "../../instructions";
import { IScope } from "../../types";
import { ObjectValue, StoreValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Lookup extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      scope,
      overloads: {
        block: { args: ["index"] },
        unit: { args: ["index"] },
        item: { args: ["index"] },
        liquid: { args: ["index"] },
      },
      handler(overload, index) {
        const output = new StoreValue(scope);
        return [
          output,
          [new InstructionBase("lookup", overload, output, index)],
        ];
      },
    });
    super(scope, data);
  }
}
