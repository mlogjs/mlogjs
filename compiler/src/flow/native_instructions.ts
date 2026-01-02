import { SourceRange } from "../SourceRange";
import { ImmutableId } from "./id";
import { NativeInstruction } from "./instructions";

export class NativeSensorInstruction extends NativeInstruction {
  constructor(
    value: ImmutableId,
    prop: ImmutableId,
    result: ImmutableId,
    loc: SourceRange,
  ) {
    super(["sensor", result, value, prop], [value, prop], [result], loc);
  }
}

export class NativeReadInstruction extends NativeInstruction {
  constructor(
    cell: ImmutableId,
    index: ImmutableId,
    result: ImmutableId,
    loc: SourceRange,
  ) {
    super(["read", result, cell, index], [cell, index], [result], loc);
  }
}

export class NativeWriteInstruction extends NativeInstruction {
  constructor(
    cell: ImmutableId,
    index: ImmutableId,
    value: ImmutableId,
    loc: SourceRange,
  ) {
    super(["write", value, cell, index], [value, cell, index], [], loc);
  }
}

export class NativePrintInstruction extends NativeInstruction {
  constructor(value: ImmutableId, loc: SourceRange) {
    super(["print", value], [value], [], loc);
  }
}
