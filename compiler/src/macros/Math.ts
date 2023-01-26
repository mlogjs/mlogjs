/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CompilerError } from "../CompilerError";
import { OperationInstruction } from "../instructions";
import { EMutability, IValue } from "../types";
import {
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  StoreValue,
} from "../values";
import { MacroFunction } from "./Function";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

const mathOperations: Record<
  string,
  ((a: number, b?: number) => number) | null
> = {
  max: (a, b) => Math.max(a, b!),
  min: (a, b) => Math.min(a, b!),
  angle: (x, y) => {
    const angle = toDegrees(Math.atan2(y!, x));
    return angle < 0 ? angle + 360 : angle;
  },
  len: (a, b) => Math.sqrt(a ** 2 + b! ** 2),
  noise: null,
  abs: a => Math.abs(a),
  log: a => Math.log(a),
  log10: a => Math.log10(a),
  sin: a => Math.sin(toRadians(a)),
  cos: a => Math.cos(toRadians(a)),
  tan: a => Math.tan(toRadians(a)),
  floor: a => Math.floor(a),
  ceil: a => Math.ceil(a),
  sqrt: a => Math.sqrt(a),
  asin: a => toDegrees(Math.asin(a)),
  acos: a => toDegrees(Math.acos(a)),
  atan: a => toDegrees(Math.atan(a)),
  // yes, this doesn't work with negative numbers
  // but the game also implements it this way.
  idiv: (a, b) => Math.floor(a / b!),
  pow: (a, b) => Math.pow(a, b!),
  rand: null,
};

const orderIndependentOperations = ["max", "min", "len"];

function createMacroMathOperations() {
  const macroMathOperations: IObjectValueData = {
    PI: new StoreValue("@pi", EMutability.constant),
    E: new StoreValue("@e", EMutability.constant),
    degToRad: new StoreValue("@degToRad", EMutability.constant),
    radToDeg: new StoreValue("@radToDeg", EMutability.constant),
  };
  for (const key in mathOperations) {
    const fn = mathOperations[key];
    macroMathOperations[key] = new MacroFunction<IValue>((scope, out, a, b) => {
      const argumentCount = +!!a + +!!b;
      if (fn && argumentCount != fn.length) {
        throw new CompilerError(
          `Expected ${fn.length} arguments, but got ${argumentCount}`
        );
      }
      const cacheKey = getCacheKey(key);
      if (b) {
        if (fn && a instanceof LiteralValue && b instanceof LiteralValue) {
          if (!a.isNumber() || !b.isNumber())
            throw new CompilerError(
              "Cannot do math operation with non-numerical literals."
            );
          return [new LiteralValue(fn(a.num, b.num)), []];
        }

        const cachedResult = scope.getCachedOperation(cacheKey, a, b);
        if (cachedResult) return [cachedResult, []];

        // max, min and len do not change if the arguments change in order
        if (orderIndependentOperations.includes(key)) {
          const cachedResult = scope.getCachedOperation(cacheKey, b, a);
          if (cachedResult) return [cachedResult, []];
        }

        const temp = StoreValue.from(scope, out);
        scope.addCachedOperation(cacheKey, temp, a, b);
        return [temp, [new OperationInstruction(key, temp, a, b)]];
      }
      if (fn && a instanceof LiteralValue) {
        if (!a.isNumber())
          throw new CompilerError(
            "Cannot do math operation with non-numerical literal."
          );

        return [new LiteralValue(fn(a.num)), []];
      }
      const cachedResult = scope.getCachedOperation(cacheKey, a);
      if (cachedResult) return [cachedResult, []];

      const temp = StoreValue.from(scope, out);

      // ensures that operations like `rand` are not cached
      if (mathOperations[key]) scope.addCachedOperation(cacheKey, temp, a);

      return [temp, [new OperationInstruction(key, temp, a, null)]];
    });
  }
  return macroMathOperations;
}

function getCacheKey(key: string) {
  if (key === "pow") return "**";
  return key;
}

export class MlogMath extends ObjectValue {
  constructor() {
    super(createMacroMathOperations());
  }
}

// op angle result a b
// op len result a b
