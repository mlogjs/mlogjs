import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { ImmutableId } from "../flow";
import { EMutability, Location } from "../types";
import { VoidValue } from "../values";

type TFunction = (
  c: ICompilerContext,
  cursor: IBlockCursor,
  loc: Location,
  ...args: ImmutableId[]
) => ImmutableId;

export class MacroFunction extends VoidValue {
  macro = true;
  mutability = EMutability.constant;
  fn: TFunction;
  constructor(fn: TFunction) {
    super();
    this.fn = fn;
  }

  call(
    c: ICompilerContext,
    cursor: IBlockCursor,
    loc: Location,
    args: ImmutableId[],
  ): ImmutableId {
    return this.fn.apply(this, [c, cursor, loc, ...args]);
  }

  debugString(): string {
    return "MacroFunction";
  }

  toMlogString(): string {
    return '"[macro MacroFunction]"';
  }
}
