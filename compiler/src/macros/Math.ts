/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { HandlerContext } from "../HandlerContext";
import {
  BinaryOperationInstruction,
  ImmutableId,
  TBinaryOperationType,
  TUnaryOperationType,
  UnaryOperatorInstruction,
} from "../flow";
import { IValue, es } from "../types";
import { mathConstants } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";
import { ComptimeMacroFunction } from "./Function";

function binary(
  context: HandlerContext,
  node: es.Node,
  operator: TBinaryOperationType,
  a: ImmutableId,
  b: ImmutableId,
) {
  const out = new ImmutableId();
  context.addInstruction(
    new BinaryOperationInstruction(operator, a, b, out, node),
  );
  return out;
}

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
  const macroMathMembers: IObjectValueData = {
    PI: c.registerValue(new LiteralValue(mathConstants.PI)),
    E: c.registerValue(new LiteralValue(mathConstants.E)),
    degToRad: c.registerValue(new LiteralValue(mathConstants.degToRad)),
    radToDeg: c.registerValue(new LiteralValue(mathConstants.radToDeg)),
  };
  const macroMathOperations: Record<string, IValue> = {
    sign: new ComptimeMacroFunction((c, context, node, [x]) => {
      assertArgumentCount(+!!x, 1);

      // inspired by the branchless sign function from
      // https://stackoverflow.com/a/14612943/13745435

      // return (a > 0) - (a < 0);
      const zero = c.registerValue(new LiteralValue(0));

      const gt = binary(context, node, "greaterThan", x, zero);
      const lt = binary(context, node, "lessThan", x, zero);
      const result = binary(context, node, "sub", gt, lt);
      return result;
    }),
    round: new ComptimeMacroFunction((c, context, node, [x]) => {
      assertArgumentCount(+!!x, 1);

      // return Math.floor(a + 0.5);

      const { floor } = macroMathOperations;
      const half = c.registerValue(new LiteralValue(0.5));

      const incremented = binary(context, node, "add", x, half);
      const result = floor.handleCall(c, context, node, [incremented])!;
      return result;
    }),
    trunc: new ComptimeMacroFunction((c, context, node, [x]) => {
      assertArgumentCount(+!!x, 1);

      // subtracts the decimal part of a number from itself
      // works with both positive and negative numbers,
      // returning the integer part of the number

      // return a - (a % 1);
      const one = c.registerValue(new LiteralValue(1));
      const rest = binary(context, node, "mod", x, one);
      const result = binary(context, node, "sub", x, rest);
      return result;
    }),
    exp: new ComptimeMacroFunction((c, context, node, [x]) => {
      assertArgumentCount(+!!x, 1);

      // return Math.E ** x;

      const { E } = macroMathMembers;

      const result = binary(context, node, "pow", E, x);
      return result;
    }),
    expm1: new ComptimeMacroFunction((c, context, node, [x]) => {
      assertArgumentCount(+!!x, 1);

      // return Math.exp(x) - 1;
      const { exp } = macroMathOperations;
      const ex = exp.handleCall(c, context, node, [x])!;
      const one = c.registerValue(new LiteralValue(1));
      const subtracted = binary(context, node, "sub", ex, one);

      return subtracted;
    }),
    cosh: new ComptimeMacroFunction((c, context, node, [degrees]) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) + Math.exp(-x)) / 2;

      // const inst: IInstruction[] = [];
      // const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      // const expx = pipeInsts(exp.call(scope, [x]), [])!;
      // const negativeX = pipeInsts(x["u-"](scope), inst);
      // const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      // const sum = pipeInsts(expx["+"](scope, expnegx), inst);
      // const result = pipeInsts(sum["/"](scope, new LiteralValue(2), out), inst);
      // return [result, inst];

      const { exp } = macroMathOperations;
      const { degToRad } = macroMathMembers;
      const two = c.registerValue(new LiteralValue(2));
      const zero = c.registerValue(new LiteralValue(0));
      const x = binary(context, node, "mul", degrees, degToRad);
      const expx = exp.handleCall(c, context, node, [x])!;
      const negativeX = binary(context, node, "sub", zero, x);
      const expnegx = exp.handleCall(c, context, node, [negativeX])!;
      const sum = binary(context, node, "add", expx, expnegx);
      const result = binary(context, node, "div", sum, two);
      return result;
    }),
    acosh: new ComptimeMacroFunction((c, context, node, [x]) => {
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
      const x2 = binary(context, node, "pow", x, two);
      const x2minus1 = binary(context, node, "sub", x2, one);
      const sqrtx2minus1 = sqrt.handleCall(c, context, node, [x2minus1])!;
      const sum = binary(context, node, "add", x, sqrtx2minus1);
      const radians = log.handleCall(c, context, node, [sum])!;
      const degrees = binary(context, node, "mul", radians, radToDeg);
      return degrees;
    }),
    sinh: new ComptimeMacroFunction((c, context, node, [degrees]) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) - Math.exp(-x)) / 2;

      // const inst: IInstruction[] = [];
      // const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      // const expx = pipeInsts(exp.call(scope, [x]), [])!;
      // const negativeX = pipeInsts(x["u-"](scope), inst);
      // const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      // const sub = pipeInsts(expx["-"](scope, expnegx), inst);
      // const result = pipeInsts(sub["/"](scope, new LiteralValue(2)), inst);
      // return [result, inst];

      const { exp } = macroMathOperations;
      const { degToRad } = macroMathMembers;
      const zero = c.registerValue(new LiteralValue(0));
      const two = c.registerValue(new LiteralValue(2));
      const x = binary(context, node, "mul", degrees, degToRad);
      const expx = exp.handleCall(c, context, node, [x])!;
      const negativeX = binary(context, node, "sub", zero, x);
      const expnegx = exp.handleCall(c, context, node, [negativeX])!;
      const sub = binary(context, node, "sub", expx, expnegx);
      const result = binary(context, node, "div", sub, two);
      return result;
    }),
    asinh: new ComptimeMacroFunction((c, context, node, [x]) => {
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
      const x2 = binary(context, node, "pow", x, two);
      const x2plus1 = binary(context, node, "add", x2, one);
      const sqrtx2plus1 = sqrt.handleCall(c, context, node, [x2plus1])!;
      const sum = binary(context, node, "add", x, sqrtx2plus1);
      const radians = log.handleCall(c, context, node, [sum])!;
      const degrees = binary(context, node, "mul", radians, radToDeg);
      return degrees;
    }),
    tanh: new ComptimeMacroFunction((c, context, node, [degrees]) => {
      assertArgumentCount(+!!degrees, 1);

      // const x = degrees * Math.degToRad;
      // return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));

      // const { exp, degToRad } = macroMathOperations;
      // const inst: IInstruction[] = [];
      // const x = pipeInsts(degrees["*"](scope, degToRad), inst);
      // const expx = pipeInsts(exp.call(scope, [x]), [])!;
      // const negativeX = pipeInsts(x["u-"](scope), inst);
      // const expnegx = pipeInsts(exp.call(scope, [negativeX]), inst)!;
      // const sub = pipeInsts(expx["-"](scope, expnegx), inst);
      // const sum = pipeInsts(expx["+"](scope, expnegx), inst);
      // const result = pipeInsts(sub["/"](scope, sum, out), inst);
      // return [result, inst];

      const { exp } = macroMathOperations;
      const { degToRad } = macroMathMembers;
      const zero = c.registerValue(new LiteralValue(0));
      const x = binary(context, node, "mul", degrees, degToRad);
      const expx = exp.handleCall(c, context, node, [x])!;
      const negativeX = binary(context, node, "sub", zero, x);
      const expnegx = exp.handleCall(c, context, node, [negativeX])!;
      const sub = binary(context, node, "sub", expx, expnegx);
      const sum = binary(context, node, "add", expx, expnegx);
      const result = binary(context, node, "div", sub, sum);
      return result;
    }),
    atanh: new ComptimeMacroFunction((c, context, node, [x]) => {
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
      const sum = binary(context, node, "add", one, x);
      const sub = binary(context, node, "sub", one, x);
      const div = binary(context, node, "div", sum, sub);
      const logOfDiv = log.handleCall(c, context, node, [div])!;
      const radians = binary(context, node, "div", logOfDiv, two);
      const degrees = binary(context, node, "mul", radians, radToDeg);
      return degrees;
    }),
  };

  for (const op of forwardedUnaryOperations) {
    macroMathOperations[op] = new ComptimeMacroFunction(
      (c, context, node, [x]) => {
        assertArgumentCount(+!!x, 1);
        const result = new ImmutableId();
        context.addInstruction(
          new UnaryOperatorInstruction(op, x, result, node),
        );
        return result;
      },
    );
  }

  for (const op of forwardedBinaryOperations) {
    macroMathOperations[op] = new ComptimeMacroFunction(
      (c, context, node, [a, b]) => {
        assertArgumentCount(+!!a + +!!b, 2);
        return binary(context, node, op, a, b);
      },
    );
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
