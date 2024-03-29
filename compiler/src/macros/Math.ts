/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CompilerError } from "../CompilerError";
import { OperationInstruction } from "../instructions";
import { IInstruction, IValue } from "../types";
import { mathConstants, pipeInsts } from "../utils";
import {
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  StoreValue,
} from "../values";
import { MacroFunction } from "./Function";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const mod = (f: number, n: number) => ((f % n) + n) % n;

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
  angleDiff: (x, y) => {
    const a = mod(x, 360);
    const b = mod(y!, 360);
    return Math.min(
      a - b < 0 ? a - b + 360 : a - b,
      b - a < 0 ? b - a + 360 : b - a,
    );
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
    PI: new LiteralValue(mathConstants.PI),
    E: new LiteralValue(mathConstants.E),
    degToRad: new LiteralValue(mathConstants.degToRad),
    radToDeg: new LiteralValue(mathConstants.radToDeg),
    sign: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // inspired by the branchless sign function from
      // https://stackoverflow.com/a/14612943/13745435

      // return (a > 0) - (a < 0);
      const inst: IInstruction[] = [];
      const zero = new LiteralValue(0);
      const gt = pipeInsts(x[">"](scope, zero), inst);
      const lt = pipeInsts(x["<"](scope, zero), inst);
      const result = pipeInsts(gt["-"](scope, lt, out), inst);
      return [result, inst];
    }),
    round: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.floor(a + 0.5);
      const inst: IInstruction[] = [];
      const half = new LiteralValue(0.5);
      const incremented = pipeInsts(x["+"](scope, half), inst);
      const { floor } = macroMathOperations;
      const result = pipeInsts(floor.call(scope, [incremented], out), inst)!;
      return [result, inst];
    }),
    trunc: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // subtracts the decimal part of a number from itself
      // works with both positive and negative numbers,
      // returning the integer part of the number

      // return a - (a % 1);
      const inst: IInstruction[] = [];
      const one = new LiteralValue(1);
      const rest = pipeInsts(x["%"](scope, one), inst);
      const result = pipeInsts(x["-"](scope, rest, out), inst);
      return [result, inst];
    }),
    exp: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.E ** x;
      const inst: IInstruction[] = [];

      const { E } = macroMathOperations;
      const result = pipeInsts(E["**"](scope, x, out), inst);
      return [result, inst];
    }),
    expm1: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.exp(x) - 1;
      const inst: IInstruction[] = [];
      const { exp } = macroMathOperations;
      const ex = pipeInsts(exp.call(scope, [x]), inst)!;
      const one = new LiteralValue(1);
      const subtracted = pipeInsts(ex["-"](scope, one, out), inst);
      return [subtracted, inst];
    }),
    cosh: new MacroFunction((scope, out, degrees) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) + Math.exp(-x)) / 2;
      const { exp, degToRad } = macroMathOperations;
      const inst: IInstruction[] = [];
      const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      const expx = pipeInsts(exp.call(scope, [x]), [])!;
      const negativeX = pipeInsts(x["u-"](scope), inst);
      const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      const sum = pipeInsts(expx["+"](scope, expnegx), inst);
      const result = pipeInsts(sum["/"](scope, new LiteralValue(2), out), inst);
      return [result, inst];
    }),
    acosh: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.log(x + Math.sqrt(x ** 2 - 1)) * Math.radToDeg;
      const { log, sqrt, radToDeg } = macroMathOperations;
      const inst: IInstruction[] = [];
      const x2 = pipeInsts(x["**"](scope, new LiteralValue(2)), inst);
      const one = new LiteralValue(1);
      const x2minus1 = pipeInsts(x2["-"](scope, one), inst);
      const sqrtx2minus1 = pipeInsts(sqrt.call(scope, [x2minus1]), inst)!;
      const sum = pipeInsts(x["+"](scope, sqrtx2minus1), inst);
      const radians = pipeInsts(log.call(scope, [sum], out), inst)!;
      const degrees = pipeInsts(radians["*"](scope, radToDeg), inst);
      return [degrees, inst];
    }),
    sinh: new MacroFunction((scope, out, degrees) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) - Math.exp(-x)) / 2;
      const { exp, degToRad } = macroMathOperations;
      const inst: IInstruction[] = [];
      const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      const expx = pipeInsts(exp.call(scope, [x]), [])!;
      const negativeX = pipeInsts(x["u-"](scope), inst);
      const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      const sub = pipeInsts(expx["-"](scope, expnegx), inst);
      const result = pipeInsts(sub["/"](scope, new LiteralValue(2)), inst);
      return [result, inst];
    }),
    asinh: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.log(x + Math.sqrt(x ** 2 + 1)) * Math.radToDeg;
      const { log, sqrt, radToDeg } = macroMathOperations;
      const inst: IInstruction[] = [];
      const x2 = pipeInsts(x["**"](scope, new LiteralValue(2)), inst);
      const x2plus1 = pipeInsts(x2["+"](scope, new LiteralValue(1)), inst);
      const sqrtx2plus1 = pipeInsts(sqrt.call(scope, [x2plus1]), inst)!;
      const sum = pipeInsts(x["+"](scope, sqrtx2plus1), inst);
      const radians = pipeInsts(log.call(scope, [sum], out), inst)!;
      const degrees = pipeInsts(radians["*"](scope, radToDeg), inst);
      return [degrees, inst];
    }),
    tanh: new MacroFunction((scope, out, degrees) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
      const { exp, degToRad } = macroMathOperations;
      const inst: IInstruction[] = [];
      const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      const expx = pipeInsts(exp.call(scope, [x]), [])!;
      const negativeX = pipeInsts(x["u-"](scope), inst);
      const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      const sub = pipeInsts(expx["-"](scope, expnegx), inst);
      const sum = pipeInsts(expx["+"](scope, expnegx), inst);
      const result = pipeInsts(sub["/"](scope, sum, out), inst);
      return [result, inst];
    }),
    atanh: new MacroFunction((scope, out, x) => {
      assertArgumentCount(+!!x, 1);

      // return (Math.log((1 + x) / (1 - x)) / 2) * Math.radToDeg;
      const { log, radToDeg } = macroMathOperations;
      const inst: IInstruction[] = [];
      const one = new LiteralValue(1);
      const two = new LiteralValue(2);
      const sum = pipeInsts(one["+"](scope, x), inst);
      const sub = pipeInsts(one["-"](scope, x), inst);
      const div = pipeInsts(sum["/"](scope, sub), inst);
      const logOfDiv = pipeInsts(log.call(scope, [div]), inst)!;
      const radians = pipeInsts(logOfDiv["/"](scope, two, out), inst);
      const degrees = pipeInsts(radians["*"](scope, radToDeg), inst);
      return [degrees, inst];
    }),
  };
  for (const key in mathOperations) {
    const fn = mathOperations[key];
    macroMathOperations[key] = new MacroFunction<IValue>((scope, out, a, b) => {
      const argumentCount = +!!a + +!!b;
      if (fn) {
        assertArgumentCount(argumentCount, fn.length);
      }
      const cacheKey = getCacheKey(key);
      if (b) {
        if (fn && a instanceof LiteralValue && b instanceof LiteralValue) {
          if (!a.isNumber() || !b.isNumber())
            throw new CompilerError(
              "Cannot do math operation with non-numerical literals.",
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
            "Cannot do math operation with non-numerical literal.",
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

function assertArgumentCount(current: number, expected: number) {
  if (current != expected) {
    throw new CompilerError(
      `Expected ${expected} arguments, but got ${current}`,
    );
  }
}
export class MlogMath extends ObjectValue {
  constructor() {
    super(createMacroMathOperations());
  }
}

// op angle result a b
// op len result a b
