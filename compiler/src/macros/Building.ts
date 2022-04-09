import { camelToDashCase, deepEval, discardedName } from "../utils";
import { InstructionBase, OperationInstruction } from "../instructions";
import { IScope, IValue, TValueInstructions } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";
import { operatorMap } from "../operators";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";

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

  eval(scope: IScope): TValueInstructions {
    this.ensureOwned();
    return super.eval(scope);
  }
}

export class BuildingBuilder extends ObjectValue {
  constructor(scope: IScope) {
    super(scope, {
      $call: new MacroFunction(scope, (nameLit: IValue) => {
        if (!(nameLit instanceof LiteralValue))
          throw new CompilerError("Block name must be a literal.");
        if (typeof nameLit.data !== "string")
          throw new CompilerError("Block name must be a string.");
        const owner = new ValueOwner({
          scope,
          value: new Building(scope),
          name: nameLit.data,
        });
        return [owner.value, []];
      }),
    });
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
    const [right, rightInst] = deepEval(scope, value);
    const temp = new StoreValue(scope);
    return [
      temp,
      [...rightInst, new OperationInstruction(kind, temp, this, right)],
    ];
  };
}
