import { IScope, IValue, TValueInstructions } from "../types";
import { VoidValue } from "../values";

type TFunction<T extends IValue | null> = (
  scope: IScope,
  ...args: IValue[]
) => TValueInstructions<T>;

export class MacroFunction<
  RT extends IValue | null = IValue
> extends VoidValue {
  macro = true;
  constant = true;
  fn: TFunction<RT>;
  constructor(fn: TFunction<RT>) {
    super();
    this.fn = fn;
  }
  call(scope: IScope, args: IValue[]): TValueInstructions<RT> {
    return this.fn.apply(this, [scope, ...args]);
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  consume(_scope: IScope): TValueInstructions {
    return [this, []];
  }
}
