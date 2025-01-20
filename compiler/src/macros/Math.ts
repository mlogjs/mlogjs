/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import {
  BinaryOperationInstruction,
  ImmutableId,
  TBinaryOperationType,
  TUnaryOperationType,
  UnaryOperatorInstruction,
} from "../flow";
import { IValue, Location } from "../types";
import { mathConstants } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";
import { MacroFunction } from "./Function";

const forwardedUnaryOperations: TUnaryOperationType[] = [
  "abs",
  "acos",
  "asin",
  "atan",
  "ceil",
  "cos",
  "floor",
  "log",
  "log10",
  "rand",
  "sin",
  "sqrt",
  "tan",
];
const forwardedBinaryOperations: TBinaryOperationType[] = [
  "angle",
  "angleDiff",
  "idiv",
  "len",
  "max",
  "min",
  "noise",
  "pow",
];

function createMacroMathOperations(c: ICompilerContext) {
  function binary(
    cursor: IBlockCursor,
    loc: Location,
    operator: TBinaryOperationType,
    a: ImmutableId,
    b: ImmutableId,
  ) {
    const out = c.createImmutableId();
    cursor.addInstruction(
      new BinaryOperationInstruction(operator, a, b, out, loc),
    );
    return out;
  }

  const macroMathMembers: IObjectValueData = {
    PI: c.registerValue(new LiteralValue(mathConstants.PI)),
    E: c.registerValue(new LiteralValue(mathConstants.E)),
    degToRad: c.registerValue(new LiteralValue(mathConstants.degToRad)),
    radToDeg: c.registerValue(new LiteralValue(mathConstants.radToDeg)),
  };
  const macroMathOperations: Record<string, IValue> = {
    sign: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // inspired by the branchless sign function from
      // https://stackoverflow.com/a/14612943/13745435

      // return (a > 0) - (a < 0);
      const zero = c.registerValue(new LiteralValue(0));

      const gt = binary(cursor, node, "greaterThan", x, zero);
      const lt = binary(cursor, node, "lessThan", x, zero);
      const result = binary(cursor, node, "sub", gt, lt);
      return result;
    }),
    round: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.floor(a + 0.5);

      const { floor } = macroMathOperations;
      const half = c.registerValue(new LiteralValue(0.5));

      const incremented = binary(cursor, node, "add", x, half);
      const result = floor.call(c, cursor, node, [incremented])!;
      return result;
    }),
    trunc: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // subtracts the decimal part of a number from itself
      // works with both positive and negative numbers,
      // returning the integer part of the number

      // return a - (a % 1);
      const one = c.registerValue(new LiteralValue(1));
      const rest = binary(cursor, node, "mod", x, one);
      const result = binary(cursor, node, "sub", x, rest);
      return result;
    }),
    exp: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.E ** x;

      const { E } = macroMathMembers;

      const result = binary(cursor, node, "pow", E, x);
      return result;
    }),
    expm1: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.exp(x) - 1;
      const { exp } = macroMathOperations;
      const ex = exp.call(c, cursor, node, [x])!;
      const one = c.registerValue(new LiteralValue(1));
      const subtracted = binary(cursor, node, "sub", ex, one);

      return subtracted;
    }),
    cosh: new MacroFunction((c, cursor, node, degrees) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) + Math.exp(-x)) / 2;

      // const inst: IInstruction[] = [];
      // const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      // const expx = pipeInsts(exp.call(scope, x), [])!;
      // const negativeX = pipeInsts(x["u-"](scope), inst);
      // const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      // const sum = pipeInsts(expx["+"](scope, expnegx), inst);
      // const result = pipeInsts(sum["/"](scope, new LiteralValue(2), out), inst);
      // return [result, inst];

      const { exp } = macroMathOperations;
      const { degToRad } = macroMathMembers;
      const two = c.registerValue(new LiteralValue(2));
      const zero = c.registerValue(new LiteralValue(0));
      const x = binary(cursor, node, "mul", degrees, degToRad);
      const expx = exp.call(c, cursor, node, [x])!;
      const negativeX = binary(cursor, node, "sub", zero, x);
      const expnegx = exp.call(c, cursor, node, [negativeX])!;
      const sum = binary(cursor, node, "add", expx, expnegx);
      const result = binary(cursor, node, "div", sum, two);
      return result;
    }),
    acosh: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.log(x + Math.sqrt(x ** 2 - 1)) * Math.radToDeg;

      // const inst: IInstruction[] = [];
      // const x2 = pipeInsts(x["**"](scope, new LiteralValue(2)), inst);
      // const x2minus1 = pipeInsts(x2["-"](scope, one), inst);
      // const sqrtx2minus1 = pipeInsts(sqrt.call(scope, [x2minus1]), inst)!;
      // const sum = pipeInsts(x["+"](scope, sqrtx2minus1), inst);
      // const radians = pipeInsts(log.call(scope, [sum], out), inst)!;
      // const degrees = pipeInsts(radians["*"](scope, radToDeg), inst);
      // return [degrees, inst];

      const { log, sqrt } = macroMathOperations;
      const { radToDeg } = macroMathMembers;
      const one = c.registerValue(new LiteralValue(1));
      const two = c.registerValue(new LiteralValue(2));
      const x2 = binary(cursor, node, "pow", x, two);
      const x2minus1 = binary(cursor, node, "sub", x2, one);
      const sqrtx2minus1 = sqrt.call(c, cursor, node, [x2minus1])!;
      const sum = binary(cursor, node, "add", x, sqrtx2minus1);
      const radians = log.call(c, cursor, node, [sum])!;
      const degrees = binary(cursor, node, "mul", radians, radToDeg);
      return degrees;
    }),
    sinh: new MacroFunction((c, cursor, node, degrees) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) - Math.exp(-x)) / 2;

      // const inst: IInstruction[] = [];
      // const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      // const expx = pipeInsts(exp.call(scope, x), [])!;
      // const negativeX = pipeInsts(x["u-"](scope), inst);
      // const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      // const sub = pipeInsts(expx["-"](scope, expnegx), inst);
      // const result = pipeInsts(sub["/"](scope, new LiteralValue(2)), inst);
      // return [result, inst];

      const { exp } = macroMathOperations;
      const { degToRad } = macroMathMembers;
      const zero = c.registerValue(new LiteralValue(0));
      const two = c.registerValue(new LiteralValue(2));
      const x = binary(cursor, node, "mul", degrees, degToRad);
      const expx = exp.call(c, cursor, node, [x])!;
      const negativeX = binary(cursor, node, "sub", zero, x);
      const expnegx = exp.call(c, cursor, node, [negativeX])!;
      const sub = binary(cursor, node, "sub", expx, expnegx);
      const result = binary(cursor, node, "div", sub, two);
      return result;
    }),
    asinh: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // return Math.log(x + Math.sqrt(x ** 2 + 1)) * Math.radToDeg;

      // const { log, sqrt, radToDeg } = macroMathOperations;
      // const inst: IInstruction[] = [];
      // const x2 = pipeInsts(x["**"](scope, new LiteralValue(2)), inst);
      // const x2plus1 = pipeInsts(x2["+"](scope, new LiteralValue(1)), inst);
      // const sqrtx2plus1 = pipeInsts(sqrt.call(scope, [x2plus1]), inst)!;
      // const sum = pipeInsts(x["+"](scope, sqrtx2plus1), inst);
      // const radians = pipeInsts(log.call(scope, [sum], out), inst)!;
      // const degrees = pipeInsts(radians["*"](scope, radToDeg), inst);
      // return [degrees, inst];
      const { log, sqrt } = macroMathOperations;
      const { radToDeg } = macroMathMembers;
      const one = c.registerValue(new LiteralValue(1));
      const two = c.registerValue(new LiteralValue(2));
      const x2 = binary(cursor, node, "pow", x, two);
      const x2plus1 = binary(cursor, node, "add", x2, one);
      const sqrtx2plus1 = sqrt.call(c, cursor, node, [x2plus1])!;
      const sum = binary(cursor, node, "add", x, sqrtx2plus1);
      const radians = log.call(c, cursor, node, [sum])!;
      const degrees = binary(cursor, node, "mul", radians, radToDeg);
      return degrees;
    }),
    tanh: new MacroFunction((c, cursor, node, degrees) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));

      // const { exp, degToRad } = macroMathOperations;
      // const inst: IInstruction[] = [];
      // const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      // const expx = pipeInsts(exp.call(scope, x), [])!;
      // const negativeX = pipeInsts(x["u-"](scope), inst);
      // const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      // const sub = pipeInsts(expx["-"](scope, expnegx), inst);
      // const sum = pipeInsts(expx["+"](scope, expnegx), inst);
      // const result = pipeInsts(sub["/"](scope, sum, out), inst);
      // return [result, inst];

      const { exp } = macroMathOperations;
      const { degToRad } = macroMathMembers;
      const zero = c.registerValue(new LiteralValue(0));
      const x = binary(cursor, node, "mul", degrees, degToRad);
      const expx = exp.call(c, cursor, node, [x])!;
      const negativeX = binary(cursor, node, "sub", zero, x);
      const expnegx = exp.call(c, cursor, node, [negativeX])!;
      const sub = binary(cursor, node, "sub", expx, expnegx);
      const sum = binary(cursor, node, "add", expx, expnegx);
      const result = binary(cursor, node, "div", sub, sum);
      return result;
    }),
    atanh: new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);

      // return (Math.log((1 + x) / (1 - x)) / 2) * Math.radToDeg;

      // const { log, radToDeg } = macroMathOperations;
      // const inst: IInstruction[] = [];
      // const one = new LiteralValue(1);
      // const two = new LiteralValue(2);
      // const sum = pipeInsts(one["+"](scope, x), inst);
      // const sub = pipeInsts(one["-"](scope, x), inst);
      // const div = pipeInsts(sum["/"](scope, sub), inst);
      // const logOfDiv = pipeInsts(log.call(scope, [div]), inst)!;
      // const radians = pipeInsts(logOfDiv["/"](scope, two, out), inst);
      // const degrees = pipeInsts(radians["*"](scope, radToDeg), inst);
      // return [degrees, inst];

      const { log } = macroMathOperations;
      const { radToDeg } = macroMathMembers;
      const one = c.registerValue(new LiteralValue(1));
      const two = c.registerValue(new LiteralValue(2));
      const sum = binary(cursor, node, "add", one, x);
      const sub = binary(cursor, node, "sub", one, x);
      const div = binary(cursor, node, "div", sum, sub);
      const logOfDiv = log.call(c, cursor, node, [div])!;
      const radians = binary(cursor, node, "div", logOfDiv, two);
      const degrees = binary(cursor, node, "mul", radians, radToDeg);
      return degrees;
    }),
  };

  for (const op of forwardedUnaryOperations) {
    macroMathOperations[op] = new MacroFunction((c, cursor, node, x) => {
      assertArgumentCount(+!!x, 1);
      const result = c.createImmutableId();
      cursor.addInstruction(new UnaryOperatorInstruction(op, x, result, node));
      return result;
    });
  }

  for (const op of forwardedBinaryOperations) {
    macroMathOperations[op] = new MacroFunction((c, cursor, node, a, b) => {
      assertArgumentCount(+!!a + +!!b, 2);
      return binary(cursor, node, op, a, b);
    });
  }

  for (const key in macroMathOperations) {
    macroMathMembers[key] = c.registerValue(macroMathOperations[key]);
  }
  return macroMathMembers;
}

function assertArgumentCount(current: number, expected: number) {
  if (current != expected) {
    throw new CompilerError(
      `Expected ${expected} arguments, but got ${current}`,
    );
  }
}
export class MlogMath extends ObjectValue {
  constructor(c: ICompilerContext) {
    super(createMacroMathOperations(c));
  }
}

// op angle result a b
// op len result a b
