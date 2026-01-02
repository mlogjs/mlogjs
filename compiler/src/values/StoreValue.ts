import { BaseValue, LiteralValue } from ".";
import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { ImmutableId, NativeSensorInstruction } from "../flow";
import { SourceRange } from "../SourceRange";
import { EMutability, IValue } from "../types";
import { camelToDashCase, itemNames } from "../utils";

/**
 * `StoreValue` represents values unknown at compile time, mostly used with
 * mutable variables and temporary values.
 *
 * Stores are mutable by default.
 */
export class StoreValue extends BaseValue implements IValue {
  temporary: boolean;
  constructor(
    public name: string,
    public mutability = EMutability.mutable,
    {
      temporary = false,
      volatile = false,
    }: Partial<Pick<StoreValue, "temporary" | "volatile">> = {},
  ) {
    super();
    this.temporary = temporary;
    this.volatile = volatile;
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    loc: SourceRange,
  ): ImmutableId {
    const prop = c.getValue(propId);
    const out = c.createImmutableId();

    if (prop) {
      const thisCoordName = getThisCoordName(this, prop);
      if (thisCoordName) {
        c.setValue(
          out,
          new StoreValue(`@this${thisCoordName}`, EMutability.constant),
        );
        return out;
      }
    }

    if (prop instanceof LiteralValue && prop.isString()) {
      // handle string length property
      const propName = prop.data === "length" ? "size" : prop.data;

      const senseId = c.createImmutableId();
      c.setValue(senseId, new StoreValue(formatSenseablePropName(propName)));

      cursor.addInstruction(
        new NativeSensorInstruction(targetId, senseId, out, loc),
      );
      return out;
    }
    if (!prop || prop instanceof StoreValue) {
      cursor.addInstruction(
        new NativeSensorInstruction(targetId, propId, out, loc),
      );
      return out;
    }
    throw new CompilerError(
      `The property [${prop.debugString()}] cannot be sensed`,
      loc,
    );
  }

  hasProperty(c: ICompilerContext, prop: IValue): boolean {
    return (
      (prop instanceof LiteralValue && prop.isString()) ||
      prop instanceof StoreValue
    );
  }

  debugString(): string {
    return `StoreValue("${this.name}")`;
  }

  toMlogString() {
    return this.name;
  }
}

export function formatSenseablePropName(name: string) {
  if (itemNames.includes(name)) return "@" + camelToDashCase(name);
  return "@" + name;
}

/**
 * If `prop` is sensing on of the coordinates of `@this`, returns the coordinate
 * name.
 */
function getThisCoordName(value: StoreValue, prop: IValue) {
  if (value.name !== "@this") return;

  let name: string | undefined;

  if (prop instanceof LiteralValue && prop.isString()) {
    name = prop.data;
  } else if (prop instanceof StoreValue && prop.name.startsWith("@")) {
    name = prop.name.slice(1);
  }

  if (name === "x" || name === "y") return name;
}
