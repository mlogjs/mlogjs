import { assertLiteralOneOf } from "../../assertions/literals";
import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

const validKinds = [
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
] as const;

export class Draw extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (kind: IValue, ...args: IValue[]) => {
      assertLiteralOneOf(kind, validKinds, "Draw kind");
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
