import { IScope, IValue, TValueInstructions } from "../types";
import { VoidValue } from "../values";

type TFunction<T extends IValue | null> = (
  ...args: IValue[]
) => TValueInstructions<T>;

export class MacroFunction<
  RT extends IValue | null = IValue
> extends VoidValue {
  macro = true;
  constant = true;
  fn: TFunction<RT>;
  constructor(scope: IScope, fn: TFunction<RT>) {
    super(scope);
    this.fn = fn;
  }
  call(scope: IScope, args: IValue[]): TValueInstructions<RT> {
    return this.fn.apply(this, args);
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
}
