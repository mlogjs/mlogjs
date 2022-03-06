import { BaseValue, LiteralValue, TempValue } from ".";
import { SetInstruction } from "../instructions";
import { operators } from "../operators";
import { IScope, IValue, TValueInstructions } from "../types";

export class StoreValue extends BaseValue implements IValue {
  name: string;
  constant = false;
  constructor(scope: IScope, name: string) {
    super(scope);
    this.name = name;
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "store"), []];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (this.constant)
      throw new Error(`Cannot assign to unmutable store '${this.name}'.`);
    if (value instanceof TempValue && value.canProxy) return value.proxy(this);
    const [evalValue, evalInst] = value.eval(scope);
    return [this, [...evalInst, new SetInstruction(this, evalValue)]];
  }
  eval(scope: IScope): TValueInstructions {
    return [this, []];
  }
  toString() {
    return this.name;
  }
}
