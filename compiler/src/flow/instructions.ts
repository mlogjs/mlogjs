import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { EJumpKind, InstructionBase, SetInstruction } from "../instructions";
import { SelectInstruction } from "../instructions/SelectInstruction";
import { SourceRange } from "../SourceRange";
import { IInstruction, TLiteral, es } from "../types";
import { LiteralValue } from "../values";
import { Block, BlockEdge, EdgeArgument } from "./block";
import { CloningContext } from "./clone_context";
import { GlobalId, ImmutableId } from "./id";
import { ReaderMap, WriterMap, constantOperationMap } from "./optimizer";

interface BasicInstruction {
  registerReader(reads: ReaderMap): void;

  unregisterReader(reads: ReaderMap): void;

  registerWriter(writes: WriterMap, block: Block): void;

  unregisterWriter(writes: WriterMap): void;
}

interface IBodyInstruction extends BasicInstruction {
  toMlog(c: ICompilerContext, writes: WriterMap): IInstruction[];
}

export interface IntermediateInstruction {
  clone(c: CloningContext): IntermediateInstruction;
}
export interface ILowerableInstruction extends BasicInstruction {
  lower(c: ICompilerContext, cursor: IBlockCursor): void;
}

export interface IConstantFoldableInstruction {
  /**
   * Attempts to perform constant folding on the instruction. If successful,
   * returns true and modifies the instruction list accordingly.
   *
   * The cursor position will be at the instruction being folded. After this
   * method is called, the caller should use `cursor.position.next` to advance
   * to the next instruction node.
   */
  constantFold(c: ICompilerContext, cursor: IBlockCursor): boolean;
}

export class AllocLocalInstruction implements IBodyInstruction {
  type = "alloc-local" as const;

  constructor(
    public address: GlobalId,
    public source: SourceRange,
  ) {}

  registerReader(reads: ReaderMap) {
    reads.add(this.address, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.address, this);
  }

  registerWriter(writes: WriterMap) {}

  unregisterWriter(writes: WriterMap) {}

  toMlog(c: ICompilerContext, writes: WriterMap): IInstruction[] {
    return [];
  }
}

export class LoadLiteralInstruction implements IBodyInstruction {
  type = "load-literal" as const;

  constructor(
    public literal: TLiteral | null,
    public out: ImmutableId,
    public source: SourceRange,
  ) {}

  registerReader(reads: ReaderMap) {}

  unregisterReader(reads: ReaderMap) {}

  registerWriter(writes: WriterMap, block: Block) {
    writes.set(this.out, this, block);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    return [];
  }

  getExpressionKey(c: ICompilerContext): string {
    return `ll:${String(this.literal)}`;
  }
}

export class LoadInstruction implements IBodyInstruction {
  type = "load" as const;

  constructor(
    public address: GlobalId,
    public out: ImmutableId,
    public source: SourceRange,
  ) {}

  registerReader(reads: ReaderMap) {
    reads.add(this.address, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.address, this);
  }

  registerWriter(writes: WriterMap, block: Block) {
    writes.set(this.out, this, block);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValueOrTemp(this.address);
    const out = c.getValueOrTemp(this.out);

    const instruction = new SetInstruction(out, value);
    instruction.source = this.source;
    return [instruction];
  }
}

export class StoreInstruction implements IBodyInstruction {
  type = "store" as const;

  constructor(
    public address: GlobalId,
    public value: ImmutableId,
    public source: SourceRange,
  ) {}

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
  source: SourceRange;
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
    source: SourceRange;
  }) {
    this.key = options.key;
    this.object = options.object;
    this.out = options.out;
    this.optionalObject = options.optionalObject ?? false;
    this.optionalKey = options.optionalKey ?? false;
    this.source = options.source;
  }

  registerReader(reads: ReaderMap) {
    reads.add(this.object, this);
    reads.add(this.key, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.object, this);
    reads.remove(this.key, this);
  }

  registerWriter(writes: WriterMap, block: Block) {
    writes.set(this.out, this, block);
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

    const result = object.get(c, cursor, this.object, this.key, this.source);
    c.setAlias(this.out, result);
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError(
      "Attempted to convert virtual value-get instruction to mlog",
      this.source,
    );
  }
}

export class ValueSetInstruction implements ILowerableInstruction {
  type = "value-set" as const;

  constructor(
    public target: ImmutableId,
    public key: ImmutableId,
    public value: ImmutableId,
    public source: SourceRange,
  ) {}

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

    target.set(c, cursor, this.target, this.key, this.value, this.source);
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
  | "emod"
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
  | "ushr"
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

export class BinaryOperationInstruction
  implements IBodyInstruction, IConstantFoldableInstruction
{
  type = "binary-operation" as const;

  constructor(
    public operator: TBinaryOperationType,
    public left: ImmutableId,
    public right: ImmutableId,
    public out: ImmutableId,
    public source: SourceRange,
  ) {}

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

  registerWriter(writes: WriterMap, block: Block) {
    writes.set(this.out, this, block);
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

  constantFold(c: ICompilerContext, cursor: IBlockCursor): boolean {
    const left = c.getValue(this.left);
    const right = c.getValue(this.right);
    if (!left || !right) return false;
    if (!(left instanceof LiteralValue) || !(right instanceof LiteralValue))
      return false;

    const value = evaluateBinaryOperation(this.operator, left, right);
    if (value === null) return false;

    c.setValue(this.out, value);
    cursor.removeInstruction();
    cursor.addInstruction(
      new LoadLiteralInstruction(value.data, this.out, this.source),
    );

    return true;
  }

  getExpressionKey(c: ICompilerContext): string {
    return `b:${this.operator}:${this.left.toString()}:${this.right.toString()}`;
  }
}

export type TBinarySelectType =
  | "equal"
  | "notEqual"
  | "lessThan"
  | "lessThanEq"
  | "greaterThan"
  | "greaterThanEq"
  | "strictEqual";

export class BinarySelectInstruction
  implements IBodyInstruction, IConstantFoldableInstruction
{
  type = "binary-select" as const;

  constructor(
    public condition: ImmutableId,
    public whenTrue: ImmutableId,
    public whenFalse: ImmutableId,
    public out: ImmutableId,
    public source: SourceRange,
  ) {}

  constantFold(c: ICompilerContext, cursor: IBlockCursor): boolean {
    if (this.whenTrue.equals(this.whenFalse)) {
      cursor.removeInstruction();
      c.setAlias(this.out, this.whenTrue);
      return true;
    }
    const condition = c.getValue(this.condition);

    if (!(condition instanceof LiteralValue)) return false;

    cursor.removeInstruction();
    c.setAlias(this.out, condition.num ? this.whenTrue : this.whenFalse);

    return true;
  }

  registerReader(reads: ReaderMap): void {
    reads.add(this.condition, this);
    reads.add(this.whenTrue, this);
    reads.add(this.whenFalse, this);
  }
  unregisterReader(reads: ReaderMap): void {
    reads.remove(this.condition, this);
    reads.remove(this.whenTrue, this);
    reads.remove(this.whenFalse, this);
  }
  registerWriter(writes: WriterMap, block: Block): void {
    writes.set(this.out, this, block);
  }
  unregisterWriter(writes: WriterMap): void {
    writes.remove(this.out);
  }

  toMlog(c: ICompilerContext, writes: WriterMap): IInstruction[] {
    const writer = writes.get(this.condition);
    const whenTrue = c.getValueOrTemp(this.whenTrue);
    const whenFalse = c.getValueOrTemp(this.whenFalse);
    const out = c.getValueOrTemp(this.out);

    let select: SelectInstruction;
    if (writer?.type === "binary-operation" && writer.isJumpMergeable()) {
      const left = c.getValueOrTemp(writer.left);
      const right = c.getValueOrTemp(writer.right);

      select = new SelectInstruction(
        out,
        writer.operator as EJumpKind,
        left,
        right,
        whenTrue,
        whenFalse,
      );
    } else {
      const condition = c.getValueOrTemp(this.condition);

      select = new SelectInstruction(
        out,
        EJumpKind.NotEqual,
        condition,
        new LiteralValue(null),
        whenTrue,
        whenFalse,
      );
    }

    select.source = this.source;
    return [select];
  }

  getExpressionKey(c: ICompilerContext) {
    return `s:${this.condition.toString()}:${this.whenTrue.toString()}:${this.whenFalse.toString()}`;
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

export class UnaryOperatorInstruction
  implements IBodyInstruction, IConstantFoldableInstruction
{
  type = "unary-operation" as const;

  constructor(
    public operator: TUnaryOperationType,
    public value: ImmutableId,
    public out: ImmutableId,
    public source: SourceRange,
  ) {}

  registerReader(reads: ReaderMap) {
    reads.add(this.value, this);
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.value, this);
  }

  registerWriter(writes: WriterMap, block: Block) {
    writes.set(this.out, this, block);
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

  constantFold(c: ICompilerContext, cursor: IBlockCursor): boolean {
    const value = c.getValue(this.value);
    if (!value) return false;
    if (!(value instanceof LiteralValue)) return false;
    const result = constantOperationMap[this.operator]?.(value.num);
    if (result === undefined) return false;
    c.setValue(this.out, new LiteralValue(result));

    cursor.removeInstruction();
    cursor.addInstruction(
      new LoadLiteralInstruction(result, this.out, this.source),
    );

    return true;
  }

  getExpressionKey(c: ICompilerContext): string {
    return `u:${this.operator}:${this.value.toString()}`;
  }
}

export type TSourceLoc = es.SourceLocation | undefined | null;

export interface IBlockParamsInstruction {
  getBlockArgumentCount(childBlock: Block): number;
  addBlockArgument(childBlock: Block, arg: EdgeArgument): void;
  getBlockArgument(childBlock: Block, index: number): EdgeArgument;
  removeBlockArgument(childBlock: Block, index: number): void;
}

export class BreakInstruction implements IBlockParamsInstruction {
  type = "break" as const;
  target: BlockEdge;

  // TODO: why do we even require node when we could just ask for .loc directly?
  constructor(
    target: Block | BlockEdge,
    public source: SourceRange,
  ) {
    this.target = target instanceof Block ? target.toForward() : target;
  }

  getBlockArgumentCount(childBlock: Block): number {
    return this.target.args.length;
  }

  addBlockArgument(childBlock: Block, arg: EdgeArgument) {
    this.target.args.push(arg);
  }

  getBlockArgument(childBlock: Block, index: number): EdgeArgument {
    return this.target.args[index];
  }

  removeBlockArgument(childBlock: Block, index: number): void {
    this.target.args.splice(index, 1);
  }
}

export class BreakIfInstruction implements IBlockParamsInstruction {
  type = "break-if" as const;
  consequent: BlockEdge;
  alternate: BlockEdge;
  constructor(
    public condition: ImmutableId,
    consequent: Block | BlockEdge,
    alternate: Block | BlockEdge,
    public source: SourceRange,
  ) {
    this.consequent =
      consequent instanceof Block ? consequent.toForward() : consequent;
    this.alternate =
      alternate instanceof Block ? alternate.toForward() : alternate;
  }

  swapEdges() {
    [this.consequent, this.alternate] = [this.alternate, this.consequent];
  }

  getBlockArgumentCount(childBlock: Block): number {
    if (this.consequent.block === childBlock) {
      return this.consequent.args.length;
    }
    if (this.alternate.block === childBlock) {
      return this.alternate.args.length;
    }
    throw new CompilerError(
      "Attempted to get block argument count from break-if for non-child block",
    );
  }

  addBlockArgument(childBlock: Block, arg: EdgeArgument) {
    if (this.consequent.block === childBlock) {
      this.consequent.args.push(arg);
    } else if (this.alternate.block === childBlock) {
      this.alternate.args.push(arg);
    } else {
      throw new CompilerError(
        "Attempted to add block argument to break-if for non-child block",
      );
    }
  }

  getBlockArgument(childBlock: Block, index: number): EdgeArgument {
    if (this.consequent.block === childBlock) {
      return this.consequent.args[index];
    }
    if (this.alternate.block === childBlock) {
      return this.alternate.args[index];
    }

    throw new CompilerError(
      "Attempted to get block argument from break-if for non-child block",
    );
  }

  removeBlockArgument(childBlock: Block, index: number): void {
    if (this.consequent.block === childBlock) {
      this.consequent.args.splice(index, 1);
    } else if (this.alternate.block === childBlock) {
      this.alternate.args.splice(index, 1);
    } else {
      throw new CompilerError(
        "Attempted to remove block argument from break-if for non-child block",
      );
    }
  }
}

export class ReturnInstruction {
  type = "return" as const;

  constructor(
    public value: ImmutableId,
    public source: SourceRange,
  ) {}
}

export class CallInstruction implements ILowerableInstruction {
  type = "call" as const;

  constructor(
    public callee: ImmutableId,
    public args: ImmutableId[],
    public out: ImmutableId,
    public source: SourceRange,
  ) {}
  registerReader(reads: ReaderMap) {
    reads.add(this.callee, this);
    this.args.forEach(arg => reads.add(arg, this));
  }

  unregisterReader(reads: ReaderMap) {
    reads.remove(this.callee, this);
    this.args.forEach(arg => reads.remove(arg, this));
  }

  registerWriter(writes: WriterMap, block: Block) {
    writes.set(this.out, this, block);
  }

  unregisterWriter(writes: WriterMap) {
    writes.remove(this.out);
  }

  lower(c: ICompilerContext, cursor: IBlockCursor) {
    const callee = c.getValueOrTemp(this.callee);
    const callResult = callee.call(c, cursor, this.source, this.args);

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

  constructor(public source: SourceRange) {}
}

export class EndIfInstruction implements IBlockParamsInstruction {
  type = "end-if" as const;
  alternate: BlockEdge;

  constructor(
    public condition: ImmutableId,
    alternate: Block | BlockEdge,
    public source: SourceRange,
  ) {
    this.alternate =
      alternate instanceof Block ? alternate.toForward() : alternate;
  }

  getBlockArgumentCount(childBlock: Block): number {
    return this.alternate.args.length;
  }

  addBlockArgument(childBlock: Block, arg: EdgeArgument) {
    this.alternate.args.push(arg);
  }

  getBlockArgument(childBlock: Block, index: number): EdgeArgument {
    return this.alternate.args[index];
  }

  removeBlockArgument(childBlock: Block, index: number): void {
    this.alternate.args.splice(index, 1);
  }
}

export class StopInstruction {
  type = "stop" as const;

  constructor(public source: SourceRange) {}
}

export class NativeInstruction implements IBodyInstruction {
  type = "native" as const;

  constructor(
    public args: (ImmutableId | string)[],
    public inputs: ImmutableId[],
    public outputs: ImmutableId[],
    public source: SourceRange,
  ) {}

  registerReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.add(input, this));
  }

  unregisterReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.remove(input, this));
  }

  registerWriter(writes: WriterMap, block: Block) {
    this.outputs.forEach(output => writes.set(output, this, block));
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
export class AsmInstruction implements IBodyInstruction {
  type = "asm" as const;

  constructor(
    public lines: (string | ImmutableId)[][],
    public code: string,
    public inputs: ImmutableId[],
    public outputs: ImmutableId[],
    public source: SourceRange,
  ) {}

  registerReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.add(input, this));
  }

  unregisterReader(reads: ReaderMap) {
    this.inputs.forEach(input => reads.remove(input, this));
  }

  registerWriter(writes: WriterMap, block: Block) {
    this.outputs.forEach(output => writes.set(output, this, block));
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
  | AllocLocalInstruction
  | LoadLiteralInstruction
  | LoadInstruction
  | StoreInstruction
  | ValueGetInstruction
  | ValueSetInstruction
  | BinaryOperationInstruction
  | BinarySelectInstruction
  | UnaryOperatorInstruction
  | CallInstruction
  | NativeInstruction
  | AsmInstruction;

export function isLowerable<T extends TBlockInstruction>(
  instruction: T,
): instruction is T & ILowerableInstruction {
  return "lower" in instruction;
}

export function getEffectiveBlockSize(
  block: Block,
  readers: ReaderMap,
): number {
  let size = 0;

  for (const inst of block.instructions) {
    switch (inst.type) {
      case "store":
        size++;
        break;
      case "load":
        break;
      case "binary-operation":
        if (!isBinaryOperationInlined(inst, readers)) size++;
        break;
      default:
        size++;
    }
  }
  return size;
}

export function isBinaryOperationInlined(
  inst: BinaryOperationInstruction,
  readerMap: ReaderMap,
): boolean {
  if (!inst.isJumpMergeable()) return false;

  const readers = readerMap.get(inst.out);

  for (const reader of readers) {
    switch (reader.type) {
      case "break-if":
      case "end-if":
      case "binary-select":
        break;
      default:
        return false;
    }
  }

  return true;
}

function evaluateBinaryOperation(
  operator: TBinaryOperationType,
  left: LiteralValue,
  right: LiteralValue,
): LiteralValue | null {
  switch (operator) {
    case "equal": {
      const a = left.data;
      const b = right.data;
      if (typeof a !== typeof b) break;
      return new LiteralValue(a === b ? 1 : 0);
    }
    case "notEqual": {
      const a = left.data;
      const b = right.data;
      if (typeof a !== typeof b) break;
      return new LiteralValue(a !== b ? 1 : 0);
    }
  }
  const value = constantOperationMap[operator]?.(left.num, right.num);
  if (value === undefined) return null;

  return new LiteralValue(value);
}
