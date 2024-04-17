import {
  EMutability,
  IScope,
  IValue,
  Location,
  TEOutput,
  TValueInstructions,
} from "../types";
import { CompilerError } from "../CompilerError";
import { ICompilerContext } from "../CompilerContext";
import { ImmutableId } from "../flow";
import { IBlockCursor } from "../BlockCursor";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class VoidValue implements IValue {
  name?: string;
  mutability = EMutability.mutable;
  macro = false;
  volatile = false;

  eval(_scope: IScope, _out?: TEOutput): TValueInstructions {
    throw new CompilerError(
      `[${this.debugString()}] cannot be evaluated into a value.`,
    );
  }
  call(
    _c: ICompilerContext,
    _cursor: IBlockCursor,
    loc: Location,
    _args: ImmutableId[],
  ): ImmutableId {
    throw new CompilerError(`[${this.debugString()}] is not callable.`, loc);
  }
  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    prop: ImmutableId,
    loc: Location,
  ): ImmutableId {
    throw new CompilerError(
      `The member [${c
        .getValueOrTemp(prop)
        .debugString()}] does not exist in [${this.debugString()}]`,
      loc,
    );
  }

  hasProperty(_compilerContext: ICompilerContext, _prop: IValue): boolean {
    return false;
  }

  preCall(_scope: IScope, _out?: TEOutput): readonly TEOutput[] | undefined {
    return;
  }

  postCall(_scope: IScope): void {}

  toOut(): IValue {
    return this;
  }

  debugString(): string {
    return "VoidValue";
  }

  toMlogString(): string {
    return '"[macro VoidValue]"';
  }
}
