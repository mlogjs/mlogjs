/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CompilerError } from "../CompilerError";
import { OperationInstruction } from "../instructions";
import { IScope, IValue } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

const mathOperations: Record<
  string,
  ((a: number, b?: number) => number) | null
> = {
  max: (a, b) => Math.max(a, b!),
  min: (a, b) => Math.min(a, b!),
  angle: (x, y) => {
    const angle = (Math.atan2(y!, x) * 180) / Math.PI;
    return angle < 0 ? angle + 360 : angle;
  },
  len: (a, b) => Math.sqrt(a ** 2 + b! ** 2),
  noise: null,
  abs: a => Math.abs(a),
  log: a => Math.log(a),
  log10: a => Math.log10(a),
  sin: a => Math.sin(a),
  cos: a => Math.cos(a),
  tan: a => Math.tan(a),
  floor: a => Math.floor(a),
  ceil: a => Math.ceil(a),
  sqrt: a => Math.sqrt(a),
  rand: null,
};

function createMacroMathOperations(scope: IScope) {
  const macroMathOperations: Record<string, MacroFunction> = {};
  for (const key in mathOperations) {
    const fn = mathOperations[key];
    macroMathOperations[key] = new MacroFunction<IValue>(scope, (a, b) => {
      if (b) {
        if (fn && a instanceof LiteralValue && b instanceof LiteralValue) {
          if (typeof a.data !== "number" || typeof b.data !== "number")
            throw new CompilerError(
              "Cannot do math operation with non-numerical literals."
            );
          return [new LiteralValue(scope, fn(a.num, b.num)), []];
        }
        const temp = new StoreValue(scope);
        return [temp, [new OperationInstruction(key, temp, a, b)]];
      }
      if (fn && a instanceof LiteralValue) {
        if (typeof a.data !== "number")
          throw new CompilerError(
            "Cannot do math operation with non-numerical literal."
          );

        return [new LiteralValue(scope, fn(a.num)), []];
      }
      const temp = new StoreValue(scope);
      return [temp, [new OperationInstruction(key, temp, a, b)]];
    });
  }
  return macroMathOperations;
}

export class MlogMath extends ObjectValue {
  constructor(scope: IScope) {
    super(scope, createMacroMathOperations(scope));
  }
}

// op angle result a b
// op len result a b
