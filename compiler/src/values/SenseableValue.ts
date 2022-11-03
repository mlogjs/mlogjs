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
import { ValueOwner } from "./ValueOwner";

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
  mutability = EMutability.constant;

  constructor(scope: IScope) {
    super(scope);
  }

  static named(
    scope: IScope,
    name?: string,
    mutability = EMutability.constant
  ) {
    const value = new SenseableValue(scope);
    value.mutability = mutability;

    new ValueOwner({
      scope,
      value,
      constant: mutability === EMutability.constant,
      name,
    });

    return value;
  }

  static out(
    scope: IScope,
    out: TEOutput | undefined,
    mutability = EMutability.mutable
  ) {
    if (!out || typeof out === "string") {
      const value = new SenseableValue(scope);
      value.mutability = mutability;

      if (out)
        new ValueOwner({
          scope,
          value,
          constant: mutability === EMutability.constant,
          name: out,
        });

      return value;
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
        ? SenseableValue.out(scope, out, mutability)
        : StoreValue.out(scope, out, mutability);
      return [
        result,
        [new InstructionBase("sensor", result, this, `@${name}`)],
      ];
    }
    if (prop instanceof StoreValue) {
      const temp = SenseableValue.out(scope, out, mutability);
      return [temp, [new InstructionBase("sensor", temp, this, prop)]];
    }
    throw new CompilerError(`Cannot sense "${prop}" property`);
  }
}
