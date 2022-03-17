import { IScope, IValue, TValueInstructions } from "../types";
import { operators } from "../operators";
import { CompilerError } from "../CompilerError";

export class VoidValue implements IValue {
  scope: IScope;
  constant = false;
  macro = false;
  constructor(scope: IScope) {
    this.scope = scope;
  }
  eval(scope: IScope): TValueInstructions {
    throw new CompilerError(`${this} cannot eval.`);
  }
  call(scope: IScope, args: IValue[]): TValueInstructions<IValue | null> {
    throw new CompilerError(`${this} cannot call.`);
  }
  get(scope: IScope, name: IValue): TValueInstructions {
    throw new CompilerError(`${this} cannot get.`);
  }
  toString(): string {
    return "void";
  }
}

// tells typescript that VoidValue implements value
export interface VoidValue extends IValue {}

for (const key of operators) {
  VoidValue.prototype[key] = function () {
    console.log(this);
    throw new CompilerError(`${this} cannot '${key}' operation.`);
  };
}
