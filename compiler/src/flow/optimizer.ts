import { ImmutableId, ValueId } from "./id";
import {
  TBinaryOperationType,
  TBlockEndInstruction,
  TBlockInstruction,
  TUnaryOperationType,
} from "./instructions";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const mod = (f: number, n: number) => ((f % n) + n) % n;

export const constantOperationMap = {
  abs: Math.abs,
  acos: a => toDegrees(Math.acos(a)),
  add: (a, b) => a + b,
  and: bitwiseOp((a, b) => a & b),
  angle: (x, y) => {
    const angle = toDegrees(Math.atan2(y, x));
    return angle < 0 ? angle + 360 : angle;
  },
  angleDiff: (x, y) => {
    const a = mod(x, 360);
    const b = mod(y, 360);
    return Math.min(
      a - b < 0 ? a - b + 360 : a - b,
      b - a < 0 ? b - a + 360 : b - a,
    );
  },
  asin: a => toDegrees(Math.asin(a)),
  atan: a => toDegrees(Math.atan(a)),
  ceil: Math.ceil,
  cos: a => Math.cos(toRadians(a)),
  div: (a, b) => a / b,
  equal: (a, b) => (a === b ? 1 : 0),
  floor: Math.floor,
  greaterThan: (a, b) => (a > b ? 1 : 0),
  greaterThanEq: (a, b) => (a >= b ? 1 : 0),
  idiv: (a, b) => Math.floor(a / b),
  land: (a, b) => (a && b ? 1 : 0),
  len: (a, b) => Math.sqrt(a ** 2 + b ** 2),
  lessThan: (a, b) => (a < b ? 1 : 0),
  lessThanEq: (a, b) => (a <= b ? 1 : 0),
  log: Math.log,
  log10: Math.log10,
  max: Math.max,
  min: Math.min,
  mod: (a, b) => a % b,
  mul: (a, b) => a * b,
  noise: null,
  not: bitwiseOp(a => ~a),
  notEqual: (a, b) => (a !== b ? 1 : 0),
  or: bitwiseOp((a, b) => a | b),
  pow: Math.pow,
  rand: null,
  shl: bitwiseOp((a, b) => a << b),
  shr: bitwiseOp((a, b) => a >> b),
  sin: a => Math.sin(toRadians(a)),
  sqrt: Math.sqrt,
  strictEqual: (a, b) => (a === b ? 1 : 0),
  sub: (a, b) => a - b,
  tan: a => Math.tan(toRadians(a)),
  xor: bitwiseOp((a, b) => a ^ b),
} as const satisfies Record<
  TBinaryOperationType,
  ((a: number, b: number) => number) | null
> &
  Record<TUnaryOperationType, ((a: number) => number) | null>;

/**
 * Performs bitwise operations on 64-bit integers to ensure that the operations
 * evaluated at compile time produce the same results as the mlog runtime.
 *
 * This is necessary because javascript converts its 64-bit floats into 32-bit
 * integers to perform bitwise operations, however mlog casts 64-bit floats into
 * 64-bit integers to achieve the same goal. This means that using javascript
 * numbers to evaluate these operations at compile time can cause disparity
 * between the compiler and the runtime for values bigger than `2^31-1`.
 */
function bitwiseOp(fn: (...args: bigint[]) => bigint) {
  return (...args: number[]) => {
    const bigResult = fn(...args.map(BigInt));

    // limit the result to 64 bits of precision (signed long)
    // and convert it back into a number
    return Number(BigInt.asIntN(64, bigResult));
  };
}

export class ReaderMap {
  reads: Map<ValueId, Set<TBlockInstruction | TBlockEndInstruction>> =
    new Map();

  private ensurePresent(id: ValueId) {
    if (!this.reads.has(id)) this.reads.set(id, new Set());
  }

  add(id: ValueId, instruction: TBlockInstruction | TBlockEndInstruction) {
    this.ensurePresent(id);
    this.reads.get(id)!.add(instruction);
  }

  remove(id: ValueId, instruction: TBlockInstruction | TBlockEndInstruction) {
    if (!this.reads.has(id)) return;

    this.reads.get(id)!.delete(instruction);
  }

  get(id: ValueId) {
    this.ensurePresent(id);
    return this.reads.get(id)!;
  }
}

export class WriterMap {
  writes: Map<ImmutableId, TBlockInstruction> = new Map();

  set(id: ImmutableId, instruction: TBlockInstruction) {
    this.writes.set(id, instruction);
  }

  remove(id: ImmutableId) {
    this.writes.delete(id);
  }

  get(id: ImmutableId) {
    return this.writes.get(id);
  }
}
