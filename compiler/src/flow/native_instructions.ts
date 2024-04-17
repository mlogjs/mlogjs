import { Location } from "../types";
import { ImmutableId } from "./id";
import { NativeInstruction } from "./instructions";

export class NativeSensorInstruction extends NativeInstruction {
  constructor(
    value: ImmutableId,
    prop: ImmutableId,
    result: ImmutableId,
    node?: Location,
  ) {
    super(["sensor", result, value, prop], [value, prop], [result], node);
  }
}

export class NativeReadInstruction extends NativeInstruction {
  constructor(
    cell: ImmutableId,
    index: ImmutableId,
    result: ImmutableId,
    node?: Location,
  ) {
    super(["read", result, cell, index], [cell, index], [result], node);
  }
}

export class NativeWriteInstruction extends NativeInstruction {
  constructor(
    cell: ImmutableId,
    index: ImmutableId,
    value: ImmutableId,
    node?: Location,
  ) {
    super(["write", value, cell, index], [value, cell, index], [], node);
  }
}

export class NativePrintInstruction extends NativeInstruction {
  constructor(value: ImmutableId, node?: Location) {
    super(["print", value], [value], [], node);
  }
}
