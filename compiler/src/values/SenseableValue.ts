import { CompilerError } from "../CompilerError";
import { InstructionBase } from "../instructions";
import { itemNames } from "../macros/Building";
import { IScope, IValue, TValueInstructions } from "../types";
import { camelToDashCase } from "../utils";
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
 * const value = new SenseableValue(scope)
 * value.constant = false
 * ```
 */
export class SenseableValue extends StoreValue {
  constant = true;

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
      const temp = new StoreValue(scope);
      return [temp, [new InstructionBase("sensor", temp, this, prop)]];
    }
    throw new CompilerError(`Cannot sense "${prop}" property`);
  }

  typeof(scope: IScope): TValueInstructions<IValue> {
    return [new LiteralValue(scope, "senseable"), []];
  }
}
