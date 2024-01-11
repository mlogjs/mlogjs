import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { InstructionBase } from "../instructions";
import { IInstruction, es } from "../types";
import { Block } from "./block";

export class ConstBindInstruction {
  type = "const-bind" as const;

  source?: es.SourceLocation;

  constructor(
    public target: number,
    public value: number,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const target = c.getValue(this.target);
    const value = c.getValue(this.value);
    if (!target || !value) throw new CompilerError("Invalid const-bind state");
    const instruction = new InstructionBase("set", target, value);
    instruction.source = this.source;
    return [instruction];
  }
}

export class AssignmentInstruction {
  type = "assignment" as const;
  source?: es.SourceLocation;
  constructor(
    public target: number,
    public value: number,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
  toMlog(c: ICompilerContext): IInstruction[] {
    const target = c.getValue(this.target);
    const value = c.getValue(this.value);
    if (!target || !value) throw new CompilerError("Invalid assignment state");
    const instruction = new InstructionBase("set", target, value);
    instruction.source = this.source;

    return [instruction];
  }
}

export class ValueGetInstruction {
  type = "value-get" as const;
  source?: es.SourceLocation;

  constructor(
    public target: number,
    public key: number,
    public out: number,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError("Not implemented");
  }
}

export class ValueSetInstruction {
  type = "value-set" as const;
  source?: es.SourceLocation;

  constructor(
    public target: number,
    public key: number,
    public value: number,
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
    public left: number,
    public right: number,
    public out: number,
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
    const left = c.getValue(this.left);
    const right = c.getValue(this.right);
    const out = c.getValue(this.out);
    if (!left || !right || !out)
      throw new CompilerError("Invalid binary operation state");
    const op = new InstructionBase("op", this.operator, out, left, right);
    op.source = this.source;
    return [op];
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
    public value: number,
    public out: number,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    const value = c.getValue(this.value);
    const out = c.getValue(this.out);
    if (!value || !out)
      throw new CompilerError("Invalid unary operation state");
    const op = new InstructionBase("op", this.operator, out, value);
    op.source = this.source;
    return [op];
  }
}

export type TSourceLoc = es.SourceLocation | undefined | null;
export class BreakInstruction {
  type = "break" as const;
  source?: es.SourceLocation;
  constructor(
    public target: Block,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
}

export class BreakIfInstruction {
  type = "break-if" as const;
  source?: es.SourceLocation;

  hasBackEdge = false;

  constructor(
    public condition: number,
    public consequent: Block,
    public alternate: Block,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
}

export class ReturnInstruction {
  type = "return" as const;
  source?: es.SourceLocation;

  constructor(
    public value: number,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }
}

export class CallInstruction {
  type = "call" as const;
  source?: es.SourceLocation;

  constructor(
    public callee: number,
    public args: number[],
    public out: number,
    node?: es.Node,
  ) {
    this.source = node?.loc ?? undefined;
  }

  toMlog(c: ICompilerContext): IInstruction[] {
    throw new CompilerError("Not implemented");
  }
}

export class EndInstruction {
  type = "end" as const;
  source?: es.SourceLocation;
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
  | AssignmentInstruction
  | ConstBindInstruction
  | ValueGetInstruction
  | ValueSetInstruction
  | BinaryOperationInstruction
  | UnaryOperatorInstruction
  | CallInstruction
  | NativeInstruction;
