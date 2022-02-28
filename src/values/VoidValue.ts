import { IScope, IValue, TValueInstructions } from "../types";
import { operators } from "../operators";

export class VoidValue implements IValue {
  scope: IScope;
  constant = false;
  macro = false;
  constructor(scope: IScope) {
    this.scope = scope;
  }
  eval(scope: IScope): TValueInstructions {
    throw new Error(`${this} cannot eval.`);
  }
  call(scope: IScope, args: IValue[]): TValueInstructions {
    throw new Error(`${this} cannot call.`);
  }
  get(scope: IScope, name: IValue): TValueInstructions {
    throw new Error(`${this} cannot get.`);
  }
  toString(): string {
    return "void";
  }
}

for (const key of operators) {
  VoidValue.prototype[key] = function () {
    console.log(this);
    throw new Error(`${this} cannot '${key}' operation.`);
  };
}
