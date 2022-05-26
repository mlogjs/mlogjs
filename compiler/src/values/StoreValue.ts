import { BaseValue, LiteralValue } from ".";
import { CompilerError } from "../CompilerError";
import { SetInstruction } from "../instructions";
import { EMutability, IScope, IValue, TValueInstructions } from "../types";
import { discardedName } from "../utils";

/**
 * `StoreValue` represents values unknown at compile time,
 * mostly used with mutable variables and temporary values
 */
export class StoreValue extends BaseValue implements IValue {
  mutability = EMutability.mutable;
  constructor(scope: IScope) {
    super(scope);
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "store"), []];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (this.mutability !== EMutability.mutable)
      throw new CompilerError(`Cannot assign to immutable store '${this}'.`);
    if (this.owner) {
      if (this.owner === value.owner && value instanceof StoreValue)
        return [this, []];
      if (!value.owner?.persistent) {
        if (!value.owner) this.owner.own(value);
        else value.owner.moveInto(this.owner);
        if (value instanceof StoreValue) return [this, []];
      }
    }
    const [evalValue, evalInst] = value.consume(scope);
    return [this, [...evalInst, new SetInstruction(this, evalValue)]];
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  consume(_scope: IScope): TValueInstructions {
    this.ensureOwned();
    return [this, []];
  }

  toString() {
    return this.owner?.name ?? discardedName;
  }
}
