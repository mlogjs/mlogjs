import { BaseValue, LiteralValue } from ".";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { ImmutableId } from "../flow";
import { InstructionBase, SetInstruction } from "../instructions";
import {
  EMutability,
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
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
    { temporary = false }: Partial<Pick<StoreValue, "temporary">> = {},
  ) {
    super();
    this.temporary = temporary;
  }

  static from(
    c: ICompilerContext,
    out?: TEOutput,
    mutability = EMutability.mutable,
  ) {
    if (out instanceof StoreValue) return out;
    const hasName = typeof out === "string";
    if (hasName) return new StoreValue(out, mutability, { temporary: false });
    const id = new ImmutableId();

    const name = hasName ? out : scope.makeTempName();

    return new StoreValue(name, mutability, {
      temporary: !hasName,
    });
  }

  static out(scope: IScope, out?: TEOutput, mutability = EMutability.mutable) {
    if (!out || typeof out === "string") {
      return new StoreValue(out ?? scope.makeTempName(), mutability, {
        temporary: !out,
      });
    }
    return out;
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (
      this.mutability !== EMutability.mutable &&
      this.mutability !== EMutability.init
    )
      throw new CompilerError(
        `Cannot assign to immutable value: [${this.debugString()}].`,
      );

    if (compareStores(this, value)) return [this, []];

    const [evalValue, evalInst] = value.eval(scope, this);

    if (evalValue.macro)
      throw new CompilerError(
        `Cannot assign a macro to a store (attempted to assign [${evalValue.debugString()}] to [${this.debugString()}])`,
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

  get(c: ICompilerContext, prop: IValue, out: ImmutableId): IInstruction[] {
    const thisCoordName = getThisCoordName(this, prop);
    if (thisCoordName) {
      c.setValue(
        out,
        new StoreValue(`@this${thisCoordName}`, EMutability.constant),
      );
      return [];
    }

    if (prop instanceof LiteralValue && prop.isString()) {
      const result = c.getValueOrTemp(out);

      return [
        new InstructionBase(
          "sensor",
          result,
          this,
          formatSenseablePropName(prop.data),
        ),
      ];
    }
    if (prop instanceof StoreValue) {
      const temp = c.getValueOrTemp(out);
      return [new InstructionBase("sensor", temp, this, prop)];
    }
    throw new CompilerError(
      `The property [${prop.debugString()}] cannot be sensed`,
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

function compareStores(left: StoreValue, right: IValue) {
  return right instanceof StoreValue && right.name === left.name;
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
