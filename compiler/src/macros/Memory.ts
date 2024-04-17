import { IValue, es } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { MacroFunction } from "./Function";
import { ICompilerContext } from "../CompilerContext";
import {
  ImmutableId,
  NativeReadInstruction,
  NativeWriteInstruction,
} from "../flow";
import { IBlockCursor } from "../BlockCursor";

class MemoryMacro extends ObjectValue {
  constructor(
    public cell: ImmutableId,
    size: ImmutableId,
  ) {
    super({
      length: size,
      size,
    });
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    node: es.Node,
  ): ImmutableId {
    const key = c.getValue(propId);
    if (key && super.hasProperty(c, key))
      return super.get(c, cursor, targetId, propId, node);

    if (key instanceof LiteralValue && !key.isNumber())
      throw new CompilerError(
        `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
      );

    const out = new ImmutableId();

    cursor.addInstruction(
      new NativeReadInstruction(this.cell, propId, out, node),
    );

    return out;
  }

  set(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    valueId: ImmutableId,
    node: es.Node,
  ): void {
    const key = c.getValue(propId);

    if (key && super.hasProperty(c, key))
      throw new CompilerError(
        `The member [${key.debugString()}] is readonly in [${this.debugString()}]`,
      );

    if (key instanceof LiteralValue && !key.isNumber())
      throw new CompilerError(
        `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
      );

    cursor.addInstruction(
      new NativeWriteInstruction(this.cell, propId, valueId, node),
    );
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
    return `Memory("${this.cell.type}")`;
  }

  toMlogString() {
    return '"[macro Memory]"';
  }
}

export class MemoryBuilder extends MacroFunction {
  constructor() {
    super((c, cursor, loc, cellId, sizeId) => {
      sizeId ??= c.registerValue(new LiteralValue(64));

      const cell = c.getValueOrTemp(cellId);
      const size = c.getValueOrTemp(sizeId);

      if (!(cell instanceof StoreValue))
        throw new CompilerError("Memory cell must be a store value.");

      if (
        !(size instanceof LiteralValue && size.isNumber()) &&
        !(size instanceof StoreValue)
      )
        throw new CompilerError(
          "The memory size must be a number literal or a store.",
        );

      return c.registerValue(new MemoryMacro(cellId, sizeId));
    });
  }
}
