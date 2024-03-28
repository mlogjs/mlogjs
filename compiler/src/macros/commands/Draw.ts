import { InstructionBase } from "../../instructions";
import { assertLiteralOneOf } from "../../utils";
import { LiteralValue, ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

const validAlignValues = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

export class Draw extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        clear: {
          args: ["r", "g", "b"],
        },
        color: {
          args: ["r", "g", "b", { key: "a", default: "" }],
        },
        col: {
          args: ["rgbaData"],
        },
        stroke: {
          args: ["width"],
        },
        line: {
          named: "options",
          args: ["x", "y", "x2", "y2"],
        },
        rect: {
          named: "options",
          args: ["x", "y", "width", "height"],
        },
        lineRect: { named: "options", args: ["x", "y", "width", "height"] },
        linePoly: {
          named: "options",
          args: ["x", "y", "sides", "radius", "rotation"],
        },
        poly: {
          named: "options",
          args: ["x", "y", "sides", "radius", "rotation"],
        },
        triangle: {
          named: "options",
          args: ["x", "y", "x2", "y2", "x3", "y3"],
        },
        image: {
          named: "options",
          args: ["x", "y", "image", "size", "rotation"],
        },
        print: {
          named: "options",
          args: ["x", "y", "align"],
        },
      },

      handler(scope, overload, out, ...args) {
        if (overload === "print") {
          const align = args[2];
          const literal =
            typeof align === "string" ? new LiteralValue(align) : align;
          assertLiteralOneOf(literal, validAlignValues, "align");

          args[2] = literal.data;
        }
        return [null, [new InstructionBase("draw", overload, ...args)]];
      },
    });

    super(data);
  }
}
