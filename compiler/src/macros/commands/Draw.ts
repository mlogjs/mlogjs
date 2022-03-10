import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

export class Draw extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (kind: IValue, ...args: IValue[]) => {
      if (!(kind instanceof LiteralValue && typeof kind.data === "string"))
        throw new Error("Draw kind must be literal.");
      if (
        [
          "clear",
          "color",
          "stroke",
          "line",
          "rect",
          "lineRect",
          "poly",
          "linePoly",
          "triangle",
          "image",
        ].indexOf(kind.data) === -1
      )
        throw new Error("Draw kind must be valid");
      return [
        null,
        [
          new InstructionBase(
            "draw",
            kind.data,
            ...args.map(v => {
              if (v instanceof LiteralValue && typeof v.data === "string")
                return v.data;
              return v;
            })
          ),
        ],
      ];
    });
  }
}
