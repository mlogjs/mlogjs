import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { ImmutableId } from "../flow";
import { EMutability, IValue, Location } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { MacroFunction } from "./Function";

export class GetBuildings extends MacroFunction {
  constructor() {
    super(c => c.registerValue(new BuildingsMacro()));
  }
}

class BuildingsMacro extends ObjectValue {
  hasProperty(c: ICompilerContext, prop: IValue): boolean {
    if (isKeyBuildingName(prop)) {
      return true;
    }
    return super.hasProperty(c, prop);
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    loc: Location,
  ): ImmutableId {
    const key = c.getValueOrTemp(propId);
    if (super.hasProperty(c, key))
      return super.get(c, cursor, targetId, propId, loc);

    if (!isKeyBuildingName(key)) {
      throw new CompilerError(
        `[${key.debugString()}] is not a valid building name`,
      );
    }

    return c.registerValue(new StoreValue(key.data, EMutability.constant));
  }
}

function isKeyBuildingName(key: IValue): key is LiteralValue<string> {
  if (!(key instanceof LiteralValue) || !key.isString()) return false;
  const regex = /^\w+$/;
  return regex.test(key.data);
}
