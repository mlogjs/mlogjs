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

    if (compareStores(this, value)) return [this, []];

    const [evalValue, evalInst] = value.eval(scope, this);

    if (evalValue.macro)
      throw new CompilerError("Cannot assign a macro to a store");

    return [this, [...evalInst, new SetInstruction(this, evalValue)]];
  }

  "=="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions {
    if (compareStores(this, value)) return [new LiteralValue(1), []];
    return super["=="](scope, value, out);
  }

  "==="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions {
    if (compareStores(this, value)) return [new LiteralValue(1), []];
    return super["==="](scope, value, out);
  }

  "!="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions {
    if (compareStores(this, value)) return [new LiteralValue(0), []];
    return super["!="](scope, value, out);
  }

  "!=="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions {
    if (compareStores(this, value)) return [new LiteralValue(0), []];
    return super["!=="](scope, value, out);
  }

  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }

  toString() {
    return this.name;
  }
}

function compareStores(left: StoreValue, right: IValue) {
  return right instanceof StoreValue && right.name === left.name;
}
