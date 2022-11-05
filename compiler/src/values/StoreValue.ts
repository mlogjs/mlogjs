import { BaseValue, LiteralValue } from ".";
import { CompilerError } from "../CompilerError";
import { SetInstruction } from "../instructions";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";

/**
 * `StoreValue` represents values unknown at compile time,
 * mostly used with mutable variables and temporary values
 */
export class StoreValue extends BaseValue implements IValue {
  constructor(public name: string, public mutability = EMutability.mutable) {
    super();
  }

  static from(scope: IScope, out?: TEOutput, mutability = EMutability.mutable) {
    if (out instanceof StoreValue) return out;
    const name = typeof out === "string" ? out : scope.makeTempName();

    return new StoreValue(name, mutability);
  }

  static out(scope: IScope, out?: TEOutput, mutability = EMutability.mutable) {
    if (!out || typeof out === "string") {
      return new StoreValue(out ?? scope.makeTempName(), mutability);
    }
    return out;
  }

  typeof(): TValueInstructions {
    return [new LiteralValue("store"), []];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (
      this.mutability !== EMutability.mutable &&
      this.mutability !== EMutability.init
    )
      throw new CompilerError(`Cannot assign to immutable store '${this}'.`);

    if (this.name === value.name && value instanceof StoreValue)
      return [this, []];

    const [evalValue, evalInst] = value.consume(scope);
    return [this, [...evalInst, new SetInstruction(this, evalValue)]];
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  consume(_scope: IScope): TValueInstructions {
    return [this, []];
  }

  toString() {
    return this.name;
  }
}
