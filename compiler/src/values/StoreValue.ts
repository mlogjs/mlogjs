import { BaseValue, LiteralValue } from ".";
import { CompilerError } from "../CompilerError";
import { InstructionBase, SetInstruction } from "../instructions";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { camelToDashCase, itemNames } from "../utils";

/**
 * `StoreValue` represents values unknown at compile time,
 * mostly used with mutable variables and temporary values.
 *
 * Stores are mutable by default.
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
      throw new CompilerError(
        `Cannot assign to immutable value: [${this.debugString()}].`
      );

    if (compareStores(this, value)) return [this, []];

    const [evalValue, evalInst] = value.eval(scope, this);

    if (evalValue.macro)
      throw new CompilerError(
        `Cannot assign a macro to a store (attempted to assign [${evalValue.debugString()}] to [${this.debugString()}])`
      );

    return [evalValue, [...evalInst, new SetInstruction(this, evalValue)]];
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

  get(scope: IScope, prop: IValue, out?: TEOutput): TValueInstructions<IValue> {
    const mutability = EMutability.readonly;
    if (prop instanceof LiteralValue && prop.isString()) {
      const name = itemNames.includes(prop.data)
        ? camelToDashCase(prop.data)
        : prop.data;

      const result = StoreValue.from(scope, out, mutability);

      return [
        result,
        [new InstructionBase("sensor", result, this, `@${name}`)],
      ];
    }
    if (prop instanceof StoreValue) {
      const temp = StoreValue.from(scope, out, mutability);
      return [temp, [new InstructionBase("sensor", temp, this, prop)]];
    }
    throw new CompilerError(
      `The property [${prop.debugString()}] cannot be sensed`
    );
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    return (
      (prop instanceof LiteralValue && prop.isString()) ||
      prop instanceof StoreValue
    );
  }

  debugString(): string {
    return `StoreValue("${this.name}")`;
  }

  toString() {
    return this.name;
  }
}

function compareStores(left: StoreValue, right: IValue) {
  return right instanceof StoreValue && right.name === left.name;
}
