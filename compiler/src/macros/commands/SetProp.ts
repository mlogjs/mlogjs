import { IBlockCursor } from "../../BlockCursor";
import { ICompilerContext } from "../../CompilerContext";
import { CompilerError } from "../../CompilerError";
import { ImmutableId, NativeInstruction } from "../../flow";
import { Location } from "../../types";
import {
  LiteralValue,
  ObjectValue,
  formatSenseablePropName,
} from "../../values";
import { MacroFunction } from "../Function";
import { filterIds } from "../util";

export class SetProp extends MacroFunction {
  constructor() {
    super((c, cursor, loc, target) => {
      if (!target) throw new CompilerError("Missing argument: target");

      return c.registerValue(new Settable(target));
    });
  }
}

class Settable extends ObjectValue {
  constructor(public target: ImmutableId) {
    super({});
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    loc: Location,
  ): ImmutableId {
    const value = c.getValueOrTemp(this.target);

    return value.get(c, cursor, this.target, propId, loc);
  }

  set(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    valueId: ImmutableId,
    loc: Location,
  ): void {
    const prop = c.getValue(propId);

    if (prop instanceof LiteralValue && prop.isString()) {
      const key = formatSenseablePropName(prop.data);
      cursor.addInstruction(
        new NativeSetPropInstruction(this.target, key, valueId, loc),
      );
      return;
    }

    cursor.addInstruction(
      new NativeSetPropInstruction(this.target, propId, valueId, loc),
    );
  }
}

class NativeSetPropInstruction extends NativeInstruction {
  constructor(
    public target: ImmutableId,
    public prop: string | ImmutableId,
    public value: ImmutableId,
    public loc: Location,
  ) {
    super(
      ["setprop", prop, target, value],
      filterIds([target, prop, value]),
      [],
      loc,
    );
  }
}
