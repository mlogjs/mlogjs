import { camelToDashCase, discardedName } from "../utils";
import { MacroFunction } from ".";
import { IScope, IValue, TValueInstructions } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { Building, itemNames } from "./Building";
import { InstructionBase, OperationInstruction } from "../instructions";
import { operatorMap } from "../operators";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";

interface NamespaceMacroOptions {
  changeCasing?: boolean;
}
export class NamespaceMacro extends ObjectValue {
  changeCasing: boolean;
  constructor(
    scope: IScope,
    { changeCasing = false }: NamespaceMacroOptions = {}
  ) {
    super(scope, {
      $get: new MacroFunction(scope, prop => {
        if (!(prop instanceof LiteralValue) || typeof prop.data !== "string")
          throw new CompilerError(
            "Cannot use dynamic properties on object macros"
          );
        const symbolName = this.changeCasing
          ? camelToDashCase(prop.data)
          : prop.data;

        const owner = new ValueOwner({
          scope,
          value: new StoreValue(scope),
          name: `@${symbolName}`,
        });
        return [owner.value, []];
      }),
    });
    this.changeCasing = changeCasing;
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor(scope: IScope) {
    super(scope);
    const $get = this.data.$get as MacroFunction;
    this.data.$get = new MacroFunction(scope, prop => {
      if (prop instanceof LiteralValue) {
        if (prop.data === "unit") {
          const owner = new ValueOwner({
            scope,
            value: new Unit(scope),
            name: "@unit",
          });
          return [owner.value, []];
        }
        if (prop.data === "this") {
          const owner = new ValueOwner({
            scope,
            value: new Building(scope),
            name: "@this",
          });
          return [owner.value, []];
        }
      }
      return $get.call(scope, [prop]);
    });
  }
}

export class UCommandsNamespace extends NamespaceMacro {
  constructor(scope: IScope) {
    super(scope);
    this.data.$get = new MacroFunction(scope, prop => {
      if (!(prop instanceof LiteralValue) || typeof prop.data !== "string")
        throw new CompilerError(
          "Cannot use dynamic properties on object macros"
        );
      const symbolName = prop.data[0].toUpperCase() + prop.data.slice(1);
      const owner = new ValueOwner({
        scope,
        name: `@command${symbolName}`,
        value: new StoreValue(scope),
      });
      return [owner.value, []];
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
          const temp = new StoreValue(scope);
          // special case, should return another unit or building
          const result = prop.data === "controller" ? new Unit(scope) : temp;
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
          "Building property acessors must be string literals or stores"
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
  Unit.prototype[key as K] = function (
    this: Unit,
    scope: IScope,
    value: IValue
  ): TValueInstructions {
    this.ensureOwned();
    const [right, rightInst] = value.eval(scope);
    const temp = new StoreValue(scope);
    return [
      temp,
      [...rightInst, new OperationInstruction(kind, temp, this, right)],
    ];
  };
}
