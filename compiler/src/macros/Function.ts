import { IScope, IValue, TValueInstructions } from "../types";
import { VoidValue } from "../values";

type TFunction = (...args: IValue[]) => TValueInstructions;

export class MacroFunction extends VoidValue {
  macro = true;
  constant = true;
  fn: TFunction;
  constructor(scope: IScope, fn: TFunction) {
    super(scope);
    this.fn = fn;
  }
  call(scope: IScope, args: IValue[]): TValueInstructions {
    return this.fn.apply(this, args);
  }
  eval(scope: IScope): TValueInstructions {
    return [this, []];
  }
}
