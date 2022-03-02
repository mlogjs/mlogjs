import { camelToDashCase } from "../utils";
import { InstructionBase, OperationInstruction } from "../instructions";
import { IScope, IValue, TValueInstructions } from "../types";
import { LiteralValue, ObjectValue, StoreValue, TempValue } from "../values";
import { MacroFunction } from "./Function";
import { operatorMap } from "../operators";

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
  name: string;
  toString() {
    return this.name;
  }
  constructor(scope: IScope, name: string) {
    super(scope, {
      $get: new MacroFunction(scope, (prop: IValue) => {
        if (prop instanceof LiteralValue && typeof prop.data === "string") {
          const name = itemNames.includes(prop.data)
            ? camelToDashCase(prop.data)
            : prop.data;
          const temp = new TempValue(scope);
          return [
            temp,
            [new InstructionBase("sensor", temp, this, `@${name}`)],
          ];
        }
        if (prop instanceof StoreValue) {
          const temp = new TempValue(scope);
          return [temp, [new InstructionBase("sensor", temp, this, prop)]];
        }
        throw new Error(
          "Building property acessors must be string literals or stores"
        );
      }),
    });
    this.name = name;
  }
}

export class BuildingBuilder extends ObjectValue {
  constructor(scope: IScope) {
    super(scope, {
      $call: new MacroFunction(scope, (nameLit: IValue) => {
        if (!(nameLit instanceof LiteralValue))
          throw new Error("Block name must be a literal.");
        if (typeof nameLit.data !== "string")
          throw new Error("Block name must be a string.");
        return [new Building(scope, nameLit.data), []];
      }),
    });
  }
}

for (const key in operatorMap) {
  const kind = operatorMap[key];
  Building.prototype[key] = function (
    this: Building,
    scope: IScope,
    value: IValue
  ): TValueInstructions {
    const left = new StoreValue(scope, this.name);
    const [right, rightInst] = value.eval(scope);
    const temp = new TempValue(scope);
    return [
      temp,
      [...rightInst, new OperationInstruction(kind, temp, left, right)],
    ];
  };
}
