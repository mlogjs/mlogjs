import { IValue } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { MacroFunction } from "./Function";
import { ImmutableId, NativeReadInstruction } from "../flow";
import { ICompilerContext } from "../CompilerContext";
import { IBlockCursor } from "../BlockCursor";
import { SourceRange } from "../SourceRange";

class StringView extends ObjectValue {
  constructor(public stringId: ImmutableId) {
    super();
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    loc: SourceRange,
  ): ImmutableId {
    const key = c.getValue(propId);
    if (key && super.hasProperty(c, key))
      return super.get(c, cursor, targetId, propId, loc);

    if (key instanceof LiteralValue) {
      if (key.data === "length") {
        const string = c.getValueOrTemp(this.stringId);
        return string.get(c, cursor, this.stringId, propId, loc);
      }

      if (!key.isNumber())
        throw new CompilerError(
          `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
          loc,
        );

      const string = c.getValue(this.stringId);
      if (string instanceof LiteralValue && string.isString()) {
        const char = string.data.charCodeAt(key.data);

        return c.registerValue(new LiteralValue(char));
      }
    }

    const out = c.createImmutableId();
    cursor.addInstruction(
      new NativeReadInstruction(this.stringId, propId, out, loc),
    );
    return out;
  }

  hasProperty(c: ICompilerContext, prop: IValue): boolean {
    if (
      (prop instanceof LiteralValue && prop.isNumber()) ||
      prop instanceof StoreValue
    )
      return true;
    return super.hasProperty(c, prop);
  }

  debugString(): string {
    return `StringView(${this.stringId.toString()})`;
  }

  toMlogString() {
    return '"[macro StringView]"';
  }
}

export class StringViewBuilder extends MacroFunction {
  constructor() {
    super((c, cursor, loc, string) => {
      return c.registerValue(new StringView(string));
    });
  }
}
