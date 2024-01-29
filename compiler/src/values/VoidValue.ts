import {
  EMutability,
  IScope,
  IValue,
  IValueOperators,
  TEOutput,
  TValueInstructions,
} from "../types";
import { operators } from "../operators";
import { CompilerError } from "../CompilerError";
import { ICompilerContext } from "../CompilerContext";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class VoidValue implements IValue {
  name?: string;
  mutability = EMutability.mutable;
  macro = false;

  eval(_scope: IScope, _out?: TEOutput): TValueInstructions {
    throw new CompilerError(
      `[${this.debugString()}] cannot be evaluated into a value.`,
    );
  }
  call(
    _c: ICompilerContext,
    _args: IValue[],
    _out?: TEOutput,
  ): TValueInstructions<IValue | null> {
    throw new CompilerError(`[${this.debugString()}] is not callable.`);
  }
  get(_compilerContext: ICompilerContext, name: IValue): TValueInstructions {
    throw new CompilerError(
      `The member [${name.debugString()}] does not exist in [${this.debugString()}]`,
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

// tells typescript that VoidValue implements value
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface VoidValue extends IValueOperators {}

for (const key of operators) {
  VoidValue.prototype[key] = function () {
    console.log(this);
    throw new CompilerError(
      `The operator '${key}' is not defined for [${this.debugString()}].`,
    );
  };
}
