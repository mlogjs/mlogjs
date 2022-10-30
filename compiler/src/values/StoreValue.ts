import { BaseValue, LiteralValue } from ".";
import { CompilerError } from "../CompilerError";
import { SetInstruction } from "../instructions";
import {
  EMutability,
  IOwnedValue,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { discardedName } from "../utils";
import { ValueOwner } from "./ValueOwner";

/**
 * `StoreValue` represents values unknown at compile time,
 * mostly used with mutable variables and temporary values
 */
export class StoreValue extends BaseValue implements IValue {
  mutability = EMutability.mutable;
  constructor(public scope: IScope) {
    super();
  }

  static named(scope: IScope, name?: string, mutability = EMutability.mutable) {
    const value = new StoreValue(scope);
    value.mutability = mutability;

    new ValueOwner({
      scope,
      value,
      constant: mutability === EMutability.constant,
      name,
    });

    return value;
  }

  static out(scope: IScope, out: TEOutput | undefined) {
    if (!out || typeof out === "string") return this.named(scope, out);
    return out;
  }

  typeof(): TValueInstructions {
    return [new LiteralValue("store"), []];
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

  ensureOwned(): asserts this is IOwnedValue {
    this.owner ??= new ValueOwner({ scope: this.scope, value: this });
  }

  toString() {
    return this.owner?.name ?? discardedName;
  }
}
