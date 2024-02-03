import { Node } from "@babel/types";
import { ICompilerContext } from "../CompilerContext";
import { HandlerContext } from "../HandlerContext";
import { ImmutableId } from "../flow";
import {
  EMutability,
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { VoidValue } from "../values";

type TFunction = (
  c: ICompilerContext,
  out: ImmutableId,
  ...args: IValue[]
) => IInstruction[];

export class MacroFunction<
  RT extends IValue | null = IValue,
> extends VoidValue {
  macro = true;
  mutability = EMutability.constant;
  fn: TFunction;
  constructor(
    fn: TFunction,
    public paramOuts?: TEOutput[],
  ) {
    super();
    this.fn = fn;
  }

  call(c: ICompilerContext, args: IValue[], out: ImmutableId): IInstruction[] {
    return this.fn.apply(this, [c, out, ...args]);
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }

  preCall(
    _scope: IScope,
    _out?: TEOutput | undefined,
  ): readonly TEOutput[] | undefined {
    return this.paramOuts;
  }

  debugString(): string {
    return "MacroFunction";
  }

  toMlogString(): string {
    return '"[macro MacroFunction]"';
  }
}

export class ComptimeMacroFunction extends VoidValue {
  macro = true;
  mutability = EMutability.constant;

  constructor(fn: IValue["handleCall"]) {
    super();
    this.handleCall = fn;
  }

  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }

  debugString(): string {
    return "ComptimeMacroFunction";
  }

  toMlogString(): string {
    return '"[macro ComptimeMacroFunction]"';
  }
}
