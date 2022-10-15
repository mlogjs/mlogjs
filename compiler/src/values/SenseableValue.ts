import { CompilerError } from "../CompilerError";
import { InstructionBase } from "../instructions";
import { EMutability, IScope, IValue, TValueInstructions } from "../types";
import { assign, camelToDashCase, itemNames } from "../utils";
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
  mutability = EMutability.constant;

  constructor(scope: IScope) {
    super(scope);
  }

  get(scope: IScope, prop: IValue): TValueInstructions<IValue> {
    if (prop instanceof LiteralValue && typeof prop.data === "string") {
      const name = itemNames.includes(prop.data)
        ? camelToDashCase(prop.data)
        : prop.data;

      const result = senseableProps.includes(prop.data)
        ? new SenseableValue(scope)
        : new StoreValue(scope);
      return [
        result,
        [new InstructionBase("sensor", result, this, `@${name}`)],
      ];
    }
    if (prop instanceof StoreValue) {
      const temp = assign(new SenseableValue(scope), {
        mutability: EMutability.readonly,
      });
      return [temp, [new InstructionBase("sensor", temp, this, prop)]];
    }
    throw new CompilerError(`Cannot sense "${prop}" property`);
  }
}
