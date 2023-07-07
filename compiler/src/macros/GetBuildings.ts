import { CompilerError } from "../CompilerError";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

export class GetBuildings extends MacroFunction {
  constructor() {
    super(() => [new BuildingsMacro(), []]);
  }
}

class BuildingsMacro extends ObjectValue {
  hasProperty(scope: IScope, prop: IValue): boolean {
    if (isKeyBuildingName(prop)) {
      return true;
    }
    return super.hasProperty(scope, prop);
  }
  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions {
    if (super.hasProperty(scope, key)) return super.get(scope, key, out);

    if (!isKeyBuildingName(key)) {
      throw new CompilerError(
        `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
      );
    }
    return [new StoreValue(key.data, EMutability.constant), []];
  }
}

function isKeyBuildingName(key: IValue): key is LiteralValue<string> {
  if (!(key instanceof LiteralValue) || !key.isString()) return false;
  const regex = /^\w+\d*$/;
  return regex.test(key.data);
}
