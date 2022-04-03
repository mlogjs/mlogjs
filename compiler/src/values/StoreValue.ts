import { BaseValue, LiteralValue } from ".";
import { CompilerError } from "../CompilerError";
import { SetInstruction } from "../instructions";
import { IScope, IValue, TValueInstructions } from "../types";
import { discardedName } from "../utils";

/**
 * `StoreValue` represents values unknown at compile time,
 * mostly used with mutable variables and temporary values
 */
export class StoreValue extends BaseValue implements IValue {
  constant = false;
  constructor(scope: IScope) {
    super(scope);
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "store"), []];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (this.constant)
      throw new CompilerError(`Cannot assign to unmutable store '${this}'.`);
    if (!this.owner)
      throw new CompilerError(`Cannot assign to temporary value`);
    if (!value.owner) {
      if (value instanceof StoreValue) this.owner.replace(value);
      else this.owner.own(value);
    } else {
      this.owner.alias(value.owner);
    }
    const [evalValue, evalInst] = value.eval(scope);
    return [this, [...evalInst, new SetInstruction(this, evalValue)]];
  }
  eval(_scope: IScope): TValueInstructions {
    this.ensureOwned();
    return [this, []];
  }

  toString() {
    return this.owner?.name ?? discardedName;
  }
}
