import { CompilerError } from "../..";
import { InstructionBase } from "../../instructions";
import { LiteralValue, ObjectValue } from "../../values";
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
        const [type] = args;
        if (!(type instanceof LiteralValue) || !type.isString()) {
          throw new CompilerError(
            `The first argument to query.${overload} must be a string literal`,
          );
        }

        if (overload === "circle") {
          const [, team, x, y, radius] = args;
          return [
            null,
            [
              new InstructionBase(
                "query",
                "circle",
                type.data,
                team,
                x,
                y,
                radius,
                "0",
              ),
            ],
          ];
        }

        const [, team, x, y, width, height] = args;
        return [
          null,
          [
            new InstructionBase(
              "query",
              "rect",
              type.data,
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
