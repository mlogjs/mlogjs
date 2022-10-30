/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CompilerError } from "../CompilerError";
import { OperationInstruction } from "../instructions";
import { EMutability, IScope, IValue } from "../types";
import { assign } from "../utils";
import {
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  StoreValue,
} from "../values";
import { ValueOwner } from "../values/ValueOwner";
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

function mathConstant(scope: IScope, name: string) {
  return new ValueOwner({
    scope,
    constant: true,
    name,
    value: assign(new StoreValue(scope), {
      mutability: EMutability.constant,
    }),
  }).value;
}

function createMacroMathOperations(scope: IScope) {
  const macroMathOperations: IObjectValueData = {
    PI: mathConstant(scope, "@pi"),
    E: mathConstant(scope, "@e"),
    degToRad: mathConstant(scope, "@degToRad"),
    radToDeg: mathConstant(scope, "@radToDeg"),
  };
  for (const key in mathOperations) {
    const fn = mathOperations[key];
    macroMathOperations[key] = new MacroFunction<IValue>((scope, out, a, b) => {
      if (b) {
        if (fn && a instanceof LiteralValue && b instanceof LiteralValue) {
          if (typeof a.data !== "number" || typeof b.data !== "number")
            throw new CompilerError(
              "Cannot do math operation with non-numerical literals."
            );
          return [new LiteralValue(fn(a.num, b.num)), []];
        }
        const temp = StoreValue.out(scope, out);
        return [temp, [new OperationInstruction(key, temp, a, b)]];
      }
      if (fn && a instanceof LiteralValue) {
        if (typeof a.data !== "number")
          throw new CompilerError(
            "Cannot do math operation with non-numerical literal."
          );

        return [new LiteralValue(fn(a.num)), []];
      }
      const temp = new StoreValue(scope);
      return [temp, [new OperationInstruction(key, temp, a, b)]];
    });
  }
  return macroMathOperations;
}

export class MlogMath extends ObjectValue {
  constructor(scope: IScope) {
    super(createMacroMathOperations(scope));
  }
}

// op angle result a b
// op len result a b
