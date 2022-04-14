import { CompilerError } from "../CompilerError";
import { InstructionBase, OperationInstruction } from "../instructions";
import { operatorMap } from "../operators";
import { IScope, IValue, TValueInstructions } from "../types";
import { camelToDashCase, discardedName } from "../utils";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

export const itemNames = [
  "copper",
  "lead",
  "metaglass",
  "graphite",
  "sand",
  "coal",
  "titanium",
  "thorium",
  "scrap",
  "silicon",
  "plastanium",
  "phaseFabric",
  "surgeAlloy",
  "sporePod",
  "blastCompound",
  "pyratite",
];

export class Building extends ObjectValue {
  toString() {
    return this.owner?.name ?? discardedName;
  }

  constructor(scope: IScope) {
    super(scope, {
      $get: new MacroFunction(scope, (prop: IValue) => {
        if (prop instanceof LiteralValue && typeof prop.data === "string") {
          const name = itemNames.includes(prop.data)
            ? camelToDashCase(prop.data)
            : prop.data;
          const temp = new StoreValue(scope);
          return [
            temp,
            [new InstructionBase("sensor", temp, this, `@${name}`)],
          ];
        }
        if (prop instanceof StoreValue) {
          const temp = new StoreValue(scope);
          return [temp, [new InstructionBase("sensor", temp, this, prop)]];
        }
        throw new CompilerError(
          "Building property acessors must be string literals or stores"
        );
      }),
    });
  }
}

// TODO: repeated logic between UnitMacro and Building
export class Unit extends ObjectValue implements IValue {
  constructor(scope: IScope) {
    super(scope, {
      $get: new MacroFunction(scope, prop => {
        if (prop instanceof LiteralValue && typeof prop.data === "string") {
          const name = itemNames.includes(prop.data)
            ? camelToDashCase(prop.data)
            : prop.data;
          // special case, should return another unit or building
          // as of writing this comment, units are virtually the
          // same as buildings, except that they have a `controller`
          // field that buildings don't have
          // so that's why I chose to return an unit
          const result =
            prop.data === "controller"
              ? new Unit(scope)
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
        throw new CompilerError(
          "Unit property acessors must be string literals or stores"
        );
      }),
    });
  }

  toString(): string {
    return this.owner?.name ?? discardedName;
  }
}

for (const key in operatorMap) {
  type K = keyof typeof operatorMap;
  const kind = operatorMap[key as K];
  Building.prototype[key as K] = function (
    this: Building,
    scope: IScope,
    value: IValue
  ): TValueInstructions {
    this.ensureOwned();
    const [right, rightInst] = value.consume(scope);
    const temp = new StoreValue(scope);
    return [
      temp,
      [...rightInst, new OperationInstruction(kind, temp, this, right)],
    ];
  };
}

for (const key in operatorMap) {
  type K = keyof typeof operatorMap;
  const kind = operatorMap[key as K];
  Unit.prototype[key as K] = function (
    this: Unit,
    scope: IScope,
    value: IValue
  ): TValueInstructions {
    this.ensureOwned();
    const [right, rightInst] = value.consume(scope);
    const temp = new StoreValue(scope);
    return [
      temp,
      [...rightInst, new OperationInstruction(kind, temp, this, right)],
    ];
  };
}
