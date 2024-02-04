import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { InstructionBase } from "../instructions";
import { IInstruction, IValue, es } from "../types";
import { appendSourceLocations } from "../utils";
import { Block, TEdge } from "./block";
import { GlobalId, ImmutableId } from "./id";

export class LoadInstruction {
  type = "load" as const;
  source?: es.SourceLocation;

  constructor(
    public address: GlobalId,
    public out: ImmutableId,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValueOrTemp(this.address);
    const out = c.getValueOrTemp(this.out);
    if (!value) throw new CompilerError("Invalid load state", this.source);
    const instruction = new InstructionBase("set", out, value);
    instruction.source = this.source;
    return [instruction];
  }
}

export class StoreInstruction {
  type = "store" as const;
  source?: es.SourceLocation;

  constructor(
    public address: GlobalId,
    public value: ImmutableId,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValueOrTemp(this.value);
    const address = c.getValueOrTemp(this.address);
    if (!value || !address)
      throw new CompilerError("Invalid store state", this.source);
    const instruction = new InstructionBase("set", address, value);
    instruction.source = this.source;
    return [instruction];
  }
}

export class ValueGetInstruction {
  type = "value-get" as const;
  source?: es.SourceLocation;
  object: ImmutableId;
  key: ImmutableId;
  out: ImmutableId;
  optional: boolean;

  constructor(options: {
    object: ImmutableId;
    key: ImmutableId;
    out: ImmutableId;
    optional: boolean;
    node?: es.Node;
  }) {
    this.key = options.key;
    this.object = options.object;
    this.out = options.out;
    this.optional = options.optional;
    this.source = options.node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const object = c.getValueOrTemp(this.object);
    const key = c.getValueOrTemp(this.key);

    const inst: IInstruction[] = [];
    if (!object.hasProperty(c, key) && !this.optional)
      throw new CompilerError("Property does not exist", this.source);
    if (object.hasProperty(c, key)) {
      inst.push(...object.get(c, key, this.out));
      appendSourceLocations(inst, { loc: this.source });
    }
    return inst;
    throw new CompilerError("Not implemented", this.source);
  }
}

export class ValueSetInstruction {
  type = "value-set" as const;
  source?: es.SourceLocation;

  constructor(
    public target: ImmutableId,
    public key: ImmutableId,
    public value: ImmutableId,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError("Not implemented");
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
    node?: es.Node,
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

  invert(): void {
    const operator = invertedOperatorMap[this.operator];
    if (!operator)
      throw new CompilerError(
        "Attempted to invert non-invertable binary operation",
      );
    this.operator = operator;
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
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
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
}

export type TSourceLoc = es.SourceLocation | undefined | null;
export class BreakInstruction {
  type = "break" as const;
  target: TEdge;
  source?: es.SourceLocation;
  constructor(target: Block | TEdge, node?: es.Node) {
    this.source = node?.loc ?? undefined;
    this.target =
      target instanceof Block ? { type: "forward", block: target } : target;
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
    node?: es.Node,
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
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
}

export class CallInstruction {
  type = "call" as const;
  source?: es.SourceLocation;

  constructor(
    public callee: ImmutableId,
    public args: ImmutableId[],
    public out: ImmutableId,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const callee = c.getValue(this.callee);
    const out = c.getValueOrTemp(this.out);
    if (!callee || !out)
      throw new CompilerError("Invalid call state", this.source);
    const args = this.args.map(arg => c.getValueOrTemp(arg));
    if (!args.every((arg): arg is IValue => !!arg))
      throw new CompilerError("Invalid call state", this.source);
    // if (callee.mutability === EMutability.constant) {
    return appendSourceLocations(callee.call(c, args, this.out), {
      loc: this.source,
    } as never);
    // }
    // throw new CompilerError("Not implemented");
  }
}

export class EndInstruction {
  type = "end" as const;
  source?: es.SourceLocation;

  constructor(node?: es.Node) {
    this.source = node?.loc ?? undefined;
  }
}

export class NativeInstruction {
  type = "native" as const;
  source?: es.SourceLocation;

  constructor(public instruction: IInstruction) {}

  toMlog(c: ICompilerContext): IInstruction[] {
    return [this.instruction];
  }
}

export type TBlockEndInstruction =
  | BreakInstruction
  | BreakIfInstruction
  | ReturnInstruction
  | EndInstruction;

export type TBlockInstruction =
  | LoadInstruction
  | StoreInstruction
  | ValueGetInstruction
  | ValueSetInstruction
  | BinaryOperationInstruction
  | UnaryOperatorInstruction
  | CallInstruction
  | NativeInstruction;
