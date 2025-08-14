import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { extractDestrucuringOut } from "../../utils";
import { ObjectValue, StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class UnpackColor extends MacroFunction {
  constructor() {
    super((scope, out, color) => {
      if (!color) {
        throw new CompilerError(`Missing argument: color`);
      }

      const outR = StoreValue.from(scope, extractDestrucuringOut(out, "r"));
      const outG = StoreValue.from(scope, extractDestrucuringOut(out, "g"));
      const outB = StoreValue.from(scope, extractDestrucuringOut(out, "b"));
      const outA = StoreValue.from(scope, extractDestrucuringOut(out, "a"));

      return [
        new ObjectValue({
          r: outR,
          g: outG,
          b: outB,
          a: outA,
        }),
        [new InstructionBase("unpackcolor", outR, outG, outB, outA, color)],
      ];
    });
  }
}
