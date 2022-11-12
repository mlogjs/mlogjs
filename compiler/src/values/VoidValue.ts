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

export class VoidValue implements IValue {
  name?: string;
  mutability = EMutability.mutable;
  macro = false;

  eval(_scope: IScope, _out?: TEOutput): TValueInstructions {
    throw new CompilerError(`${this} cannot eval.`);
  }
  call(
    _scope: IScope,
    _args: IValue[],
    _out?: TEOutput
  ): TValueInstructions<IValue | null> {
    throw new CompilerError(`${this} cannot call.`);
  }
  get(_scope: IScope, _name: IValue): TValueInstructions {
    throw new CompilerError(`${this} cannot get.`);
  }

  preCall(_scope: IScope, _out?: TEOutput): readonly IValue[] | undefined {
    return;
  }

  postCall(_scope: IScope): void {}

  toString(): string {
    return "void";
  }
}

// tells typescript that VoidValue implements value
export interface VoidValue extends IValueOperators {}

for (const key of operators) {
  VoidValue.prototype[key] = function () {
    console.log(this);
    throw new CompilerError(`${this} cannot '${key}' operation.`);
  };
}
