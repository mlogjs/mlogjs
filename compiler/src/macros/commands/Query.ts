import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Query extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        circle: {
          named: "options",
          args: ["type", { key: "team", default: "null" }, "x", "y", "radius"],
        },
        rect: {
          named: "options",
          args: [
            "type",
            { key: "team", default: "null" },
            "x",
            "y",
            "width",
            "height",
          ],
        },
      },
      handler(scope, overload, out, ...args) {
        if (overload === "circle") {
          const [type, team, x, y, radius] = args;
          return [
            null,
            [
              new InstructionBase(
                "query",
                "circle",
                type,
                team,
                x,
                y,
                radius,
                "0",
              ),
            ],
          ];
        }
        const [type, team, x, y, width, height] = args;
        return [
          null,
          [
            new InstructionBase(
              "query",
              "rect",
              type,
              team,
              x,
              y,
              width,
              height,
            ),
          ],
        ];
      },
    });
    super(data);
  }
}
