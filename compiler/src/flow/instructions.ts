import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { InstructionBase, SetInstruction } from "../instructions";
import { IInstruction, Location, TLiteral, es } from "../types";
import { nullId } from "../utils";
import { LiteralValue } from "../values";
import { Block, TEdge } from "./block";
import { GlobalId, ImmutableId } from "./id";
import { ReaderMap, WriterMap, constantOperationMap } from "./optimizer";

export interface ILowerableInstruction {
  lower(c: ICompilerContext, cursor: IBlockCursor): void;
}

export class LoadInstruction {
  type = "load" as const;
  source?: es.SourceLocation;

  constructor(
    public address: GlobalId,
    public out: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValueOrTemp(this.address);
    const out = c.getValueOrTemp(this.out);

    const instruction = new SetInstruction(out, value);
    instruction.source = this.source;
    return [instruction];
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.address, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.address, this);
  }

  registerWriter(writes: WriterMap) {
    writes.set(this.out, this);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }
}

export class StoreInstruction {
  type = "store" as const;
  source?: es.SourceLocation;

  constructor(
    public address: GlobalId,
    public value: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.value, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.value, this);
  }

  registerWriter(writes: WriterMap) {}

  unregisterWriter(writes: WriterMap) {}

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValueOrTemp(this.value);
    const address = c.getValueOrTemp(this.address);

    const instruction = new SetInstruction(address, value);
    instruction.source = this.source;
    return [instruction];
  }
}

export class ValueGetInstruction implements ILowerableInstruction {
  type = "value-get" as const;
  source?: es.SourceLocation;
  object: ImmutableId;
  key: ImmutableId;
  out: ImmutableId;
  optionalObject: boolean;
  optionalKey: boolean;

  constructor(options: {
    object: ImmutableId;
    key: ImmutableId;
    out: ImmutableId;
    optionalKey?: boolean;
    optionalObject?: boolean;
    node?: Location;
  }) {
    this.key = options.key;
    this.object = options.object;
    this.out = options.out;
    this.optionalObject = options.optionalObject ?? false;
    this.optionalKey = options.optionalKey ?? false;
    this.source = options.node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.object, this);
    reads.add(this.key, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.object, this);
    reads.remove(this.key, this);
  }

  registerWriter(writes: WriterMap) {
    writes.set(this.out, this);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  lower(c: ICompilerContext, cursor: IBlockCursor) {
    const object = c.getValueOrTemp(this.object);
    const key = c.getValueOrTemp(this.key);

    if (this.optionalObject) {
      if (object instanceof LiteralValue && object.data === null) {
        c.setAlias(this.out, c.nullId);
        return;
      }
    }

    if (this.optionalKey) {
      if (!object.hasProperty(c, key)) {
        c.setAlias(this.out, c.nullId);
        return;
      }
    }

    const result = object.get(c, cursor, this.object, this.key, {
      loc: this.source,
    });
    c.setAlias(this.out, result);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError(
      "Attempted to convert virtual value-get instruction to mlog",
      this.source,
    );
  }
}

export class ValueSetInstruction {
  type = "value-set" as const;
  source?: es.SourceLocation;

  constructor(
    public target: ImmutableId,
    public key: ImmutableId,
    public value: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.target, this);
    reads.add(this.key, this);
    reads.add(this.value, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.target, this);
    reads.remove(this.key, this);
    reads.remove(this.value, this);
  }

  // TODO: update after implementing functions
  registerWriter(writes: WriterMap) {}

  unregisterWriter(writes: WriterMap) {}

  lower(c: ICompilerContext, cursor: IBlockCursor) {
    const target = c.getValueOrTemp(this.target);

    if (!target.set)
      throw new CompilerError(
        "This object does not support setting values",
        this.source,
      );

    target.set(c, cursor, this.target, this.key, this.value, {
      loc: this.source,
    });
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError(
      "Attempted to convert virtual value-set instruction to mlog",
      this.source,
    );
  }
}

export type TBinaryOperationType =
  | "add"
  | "sub"
  | "mul"
  | "div"
  | "idiv"
  | "mod"
  | "pow"
  | "equal"
  | "notEqual"
  | "lessThan"
  | "lessThanEq"
  | "greaterThan"
  | "greaterThanEq"
  | "land"
  | "strictEqual"
  | "shl"
  | "shr"
  | "or"
  | "and"
  | "xor"
  | "max"
  | "min"
  | "angle"
  | "angleDiff"
  | "len"
  | "noise";

const invertedOperatorMap: Partial<
  Record<TBinaryOperationType, TBinaryOperationType>
> = {
  equal: "notEqual",
  notEqual: "equal",
  lessThan: "greaterThanEq",
  lessThanEq: "greaterThan",
  greaterThan: "lessThanEq",
  greaterThanEq: "lessThan",
};

export class BinaryOperationInstruction {
  type = "binary-operation" as const;
  source?: es.SourceLocation;

  constructor(
    public operator: TBinaryOperationType,
    public left: ImmutableId,
    public right: ImmutableId,
    public out: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  isJumpMergeable() {
    switch (this.operator) {
      case "equal":
      case "notEqual":
      case "lessThan":
      case "lessThanEq":
      case "greaterThan":
      case "greaterThanEq":
      case "strictEqual":
        return true;
      default:
        return false;
    }
  }

  isInvertible() {
    return this.operator in invertedOperatorMap;
  }

  isCanonicalizable() {
    switch (this.operator) {
      case "equal":
      case "notEqual":
      case "strictEqual":
      case "add":
      case "mul":
      case "land":
      case "or":
      case "and":
      case "xor":
      case "max":
      case "min":
      case "angle":
      case "angleDiff":
      case "len":
      case "lessThan":
      case "lessThanEq":
      case "greaterThan":
      case "greaterThanEq":
        return true;
      default:
        return false;
    }
  }

  canonicalize() {
    switch (this.operator) {
      case "greaterThan":
        this.operator = "lessThan";
        break;
      case "greaterThanEq":
        this.operator = "lessThanEq";
        break;
      case "lessThan":
        this.operator = "greaterThan";
        break;
      case "lessThanEq":
        this.operator = "greaterThanEq";
        break;
    }
    [this.left, this.right] = [this.right, this.left];
  }

  invert(): void {
    const operator = invertedOperatorMap[this.operator];
    if (!operator)
      throw new CompilerError(
        "Attempted to invert non-invertable binary operation",
      );
    this.operator = operator;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.left, this);
    reads.add(this.right, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.left, this);
    reads.remove(this.right, this);
  }

  registerWriter(writes: WriterMap) {
    writes.set(this.out, this);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const left = c.getValueOrTemp(this.left);
    const right = c.getValueOrTemp(this.right);
    const out = c.getValueOrTemp(this.out);
    if (!left || !right || !out)
      throw new CompilerError("Invalid binary operation state", this.source);
    const op = new InstructionBase("op", this.operator, out, left, right);
    op.source = this.source;
    return [op];
  }

  constantFold(c: ICompilerContext): boolean {
    const left = c.getValue(this.left);
    const right = c.getValue(this.right);
    if (!left || !right) return false;
    if (!(left instanceof LiteralValue) || !(right instanceof LiteralValue))
      return false;
    switch (this.operator) {
      case "equal": {
        const a = left.data as TLiteral;
        const b = right.data as TLiteral;
        if (typeof a !== typeof b) break;
        c.setValue(this.out, new LiteralValue(a === b ? 1 : 0));
        return true;
      }
      case "notEqual": {
        const a = left.data as TLiteral;
        const b = right.data as TLiteral;
        if (typeof a !== typeof b) break;
        c.setValue(this.out, new LiteralValue(a !== b ? 1 : 0));
        return true;
      }
    }
    const value = constantOperationMap[this.operator]?.(left.num, right.num);
    if (value === undefined) return false;

    c.setValue(this.out, new LiteralValue(value));
    return true;
  }
}

export type TUnaryOperationType =
  | "not"
  | "abs"
  | "log"
  | "log10"
  | "floor"
  | "ceil"
  | "sqrt"
  | "rand"
  | "sin"
  | "cos"
  | "tan"
  | "asin"
  | "acos"
  | "atan";

export class UnaryOperatorInstruction {
  type = "unary-operation" as const;
  source?: es.SourceLocation;

  constructor(
    public operator: TUnaryOperationType,
    public value: ImmutableId,
    public out: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.value, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.value, this);
  }

  registerWriter(writes: WriterMap) {
    writes.set(this.out, this);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValueOrTemp(this.value);
    const out = c.getValueOrTemp(this.out);
    if (!value || !out)
      throw new CompilerError("Invalid unary operation state", this.source);
    const op = new InstructionBase("op", this.operator, out, value);
    op.source = this.source;
    return [op];
  }

  constantFold(c: ICompilerContext): boolean {
    const value = c.getValue(this.value);
    if (!value) return false;
    if (!(value instanceof LiteralValue)) return false;
    const result = constantOperationMap[this.operator]?.(value.num);
    if (result === undefined) return false;
    c.setValue(this.out, new LiteralValue(result));
    return true;
  }
}

export type TSourceLoc = es.SourceLocation | undefined | null;
export class BreakInstruction {
  type = "break" as const;
  target: TEdge;
  source?: es.SourceLocation;
  // TODO: why do we even require node when we could just ask for .loc directly?
  constructor(target: Block | TEdge, node?: Location) {
    this.source = node?.loc ?? undefined;
    this.target = target instanceof Block ? target.toForward() : target;
  }
}

export class BreakIfInstruction {
  type = "break-if" as const;
  source?: es.SourceLocation;
  consequent: TEdge;
  alternate: TEdge;

  constructor(
    public condition: ImmutableId,
    consequent: Block | TEdge,
    alternate: Block | TEdge,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
    this.consequent =
      consequent instanceof Block ? consequent.toForward() : consequent;
    this.alternate =
      alternate instanceof Block ? alternate.toForward() : alternate;
  }
}

export class ReturnInstruction {
  type = "return" as const;
  source?: es.SourceLocation;

  constructor(
    public value: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }
}

export class CallInstruction implements ILowerableInstruction {
  type = "call" as const;
  source?: es.SourceLocation;

  constructor(
    public callee: ImmutableId,
    public args: ImmutableId[],
    public out: ImmutableId,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.callee, this);
    this.args.forEach(arg => reads.add(arg, this));
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.callee, this);
    this.args.forEach(arg => reads.remove(arg, this));
  }

  registerWriter(writes: WriterMap) {
    writes.set(this.out, this);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  lower(c: ICompilerContext, cursor: IBlockCursor) {
    const callee = c.getValueOrTemp(this.callee);
    const callResult = callee.call(c, cursor, { loc: this.source }, this.args);

    c.setAlias(this.out, callResult);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError(
      "Attempted to convert virtual call instruction to mlog",
      this.source,
    );
    // const callee = c.getValue(this.callee);
    // const out = c.getValueOrTemp(this.out);
    // if (!callee || !out)
    //   throw new CompilerError("Invalid call state", this.source);
    // const args = this.args.map(arg => c.getValueOrTemp(arg));
    // if (!args.every((arg): arg is IValue => !!arg))
    //   throw new CompilerError("Invalid call state", this.source);
    // // if (callee.mutability === EMutability.constant) {
    // callee.call(c, cursor, { loc: this.source }, this.args);
    // return appendSourceLocations(callee.call(c, args), {
    //   loc: this.source,
    // } as never);
    // }
    // throw new CompilerError("Not implemented");
  }
}

export class EndInstruction {
  type = "end" as const;
  source?: es.SourceLocation;

  constructor(node?: Location) {
    this.source = node?.loc ?? undefined;
  }
}

export class EndIfInstruction {
  type = "end-if" as const;
  source?: es.SourceLocation;
  alternate: TEdge;

  constructor(
    public condition: ImmutableId,
    alternate: Block | TEdge,
    node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
    this.alternate =
      alternate instanceof Block ? alternate.toForward() : alternate;
  }
}

export class StopInstruction {
  type = "stop" as const;

  source?: es.SourceLocation;

  constructor(node?: Location) {
    this.source = node?.loc ?? undefined;
  }
}

export class NativeInstruction {
  type = "native" as const;
  source?: es.SourceLocation;

  constructor(
    public args: (ImmutableId | string)[],
    public inputs: ImmutableId[],
    public outputs: ImmutableId[],
    public node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.add(input, this));
  }

  unregisterReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.remove(input, this));
  }

  registerWriter(writes: WriterMap) {
    this.outputs.forEach(output => writes.set(output, this));
  }

  unregisterWriter(writes: WriterMap) {
    this.outputs.forEach(output => writes.remove(output));
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const inst = new InstructionBase(
      ...this.args.map(arg =>
        typeof arg === "string" ? arg : c.getValueOrTemp(arg),
      ),
    );
    inst.source = this.source;
    return [inst];
  }
}

//  TODO: handle variable mutations
export class AsmInstruction {
  type = "asm" as const;
  source?: es.SourceLocation;

  constructor(
    public lines: (string | ImmutableId)[][],
    public code: string,
    public inputs: ImmutableId[],
    public outputs: ImmutableId[],
    public node?: Location,
  ) {
    this.source = node?.loc ?? undefined;
  }

  registerReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.add(input, this));
  }

  unregisterReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.remove(input, this));
  }

  registerWriter(writes: WriterMap) {
    this.outputs.forEach(output => writes.set(output, this));
  }

  unregisterWriter(writes: WriterMap) {
    this.outputs.forEach(output => writes.remove(output));
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    return [
      new InstructionBase(
        this.code,
        ...this.inputs.map(input => c.getValueOrTemp(input)),
      ),
    ];
  }
}

export type TBlockEndInstruction =
  | BreakInstruction
  | BreakIfInstruction
  | ReturnInstruction
  | EndInstruction
  | EndIfInstruction
  | StopInstruction;

export type TBlockInstruction =
  | LoadInstruction
  | StoreInstruction
  | ValueGetInstruction
  | ValueSetInstruction
  | BinaryOperationInstruction
  | UnaryOperatorInstruction
  | CallInstruction
  | NativeInstruction
  | AsmInstruction;

export function isLowerable<T extends TBlockInstruction>(
  instruction: T,
): instruction is T & ILowerableInstruction {
  return "lower" in instruction;
}
