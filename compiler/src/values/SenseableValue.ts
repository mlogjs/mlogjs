import { CompilerError } from "../CompilerError";
import { InstructionBase } from "../instructions";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { camelToDashCase, itemNames } from "../utils";
import { LiteralValue } from "./LiteralValue";
import { StoreValue } from "./StoreValue";

/**
 * Properties that should return a new `SenseableValue`
 */
const senseableProps = ["controller"];

/**
 * Senseable values are "objects" in the mlog runtime that
 * have special properties that can be accessed
 * via the `sense` instruction.
 *
 * This class extends `StoreValue` to allow dynamic behavior
 * that is not possible with object macros.
 *
 * Note that these values are constant by default, so make sure
 * to set that field to `false` if you want them to be assignable. Example:
 * ```
 * const value = assign(new SenseableValue(scope), {
 *   mutability: EMutability.mutable
 * })
 * ```
 */
export class SenseableValue extends StoreValue {
  constructor(name: string, mutability = EMutability.constant) {
    super(name, mutability);
  }

  static from(
    scope: IScope,
    out?: TEOutput,
    mutability = EMutability.constant
  ) {
    if (out instanceof SenseableValue) return out;
    const name = typeof out === "string" ? out : scope.makeTempName();

    return new SenseableValue(name, mutability);
  }

  static out(scope: IScope, out?: TEOutput, mutability = EMutability.mutable) {
    if (!out || typeof out === "string") {
      return new SenseableValue(out ?? scope.makeTempName(), mutability);
    }
    return out;
  }

  get(scope: IScope, prop: IValue, out?: TEOutput): TValueInstructions<IValue> {
    const mutability = EMutability.readonly;
    if (prop instanceof LiteralValue && prop.isString()) {
      const name = itemNames.includes(prop.data)
        ? camelToDashCase(prop.data)
        : prop.data;

      const result = senseableProps.includes(prop.data)
        ? SenseableValue.from(scope, out, mutability)
        : StoreValue.from(scope, out, mutability);
      return [
        result,
        [new InstructionBase("sensor", result, this, `@${name}`)],
      ];
    }
    if (prop instanceof StoreValue) {
      const temp = SenseableValue.from(scope, out, mutability);
      return [temp, [new InstructionBase("sensor", temp, this, prop)]];
    }
    throw new CompilerError(`Cannot sense "${prop}" property`);
  }
}
