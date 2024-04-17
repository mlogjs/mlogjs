import { ICompilerContext } from "../../CompilerContext";
import { NativeInstruction } from "../../flow";
import { nullId } from "../../utils";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class Draw extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
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
        translate: {
          args: ["x", "y"],
        },
        scale: {
          args: ["x", "y"],
        },
        rotate: {
          args: ["degrees"],
        },
        reset: { args: [] },
      },

      handler(c, overload, cursor, loc, ...args) {
        cursor.addInstruction(
          new NativeInstruction(
            ["draw", overload, ...args],
            filterIds(args),
            [],
            loc,
          ),
        );
        return nullId;
      },
    });

    super(data);
  }
}
