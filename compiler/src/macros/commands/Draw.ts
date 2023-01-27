import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

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
      },

      handler(scope, overload, out, ...args) {
        return [null, [new InstructionBase("draw", overload, ...args)]];
      },
    });

    super(data);
  }
}
