import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class SetBlock extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        floor: { args: ["x", "y", "to"] },
        ore: { args: ["x", "y", "to"] },
        block: {
          named: "options",
          args: ["x", "y", "to", "team", { key: "rotation", default: "0" }],
        },
      },
      handler(scope, overload, out, x, y, to, team, rotation) {
        return [
          null,
          [
            new InstructionBase(
              "setblock",
              overload,
              to,
              x,
              y,
              team ?? "@delerict",
              rotation ?? "0"
            ),
          ],
        ];
      },
    });
    super(data);
  }
}
