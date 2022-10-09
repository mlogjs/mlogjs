import {
  EMutability,
  IScope,
  IValue,
  IValueOperators,
  IValueOwner,
  TValueInstructions,
} from "../types";
import { operators } from "../operators";
import { CompilerError } from "../CompilerError";

export class VoidValue implements IValue {
  owner: IValueOwner | null = null;
  mutability = EMutability.mutable;
  macro = false;

  eval(_scope: IScope): TValueInstructions {
    throw new CompilerError(`${this} cannot eval.`);
  }
  consume(_scope: IScope): TValueInstructions<IValue> {
    throw new CompilerError(`${this} cannot be consumed.`);
  }
  call(_scope: IScope, _args: IValue[]): TValueInstructions<IValue | null> {
    throw new CompilerError(`${this} cannot call.`);
  }
  get(_scope: IScope, _name: IValue): TValueInstructions {
    throw new CompilerError(`${this} cannot get.`);
  }
  ensureOwned(): void {
    throw new CompilerError(`${this} cannot be owned`);
  }
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
