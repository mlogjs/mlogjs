import { camelToDashCase } from "../utils";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
  es,
} from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { ICompilerContext } from "../CompilerContext";
import { ImmutableId, LoadInstruction } from "../flow";
import { IBlockCursor } from "../BlockCursor";

const dynamicVars = [
  "unit",
  "tick",
  "time",
  "second",
  "minute",
  "waveNumber",
  "waveTime",
];

interface NamespaceMacroOptions {
  changeCasing?: boolean;
}
export class NamespaceMacro extends ObjectValue {
  changeCasing: boolean;
  constructor({ changeCasing = false }: NamespaceMacroOptions = {}) {
    super();
    this.changeCasing = changeCasing;
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

    if (!(key instanceof LiteralValue) || !key.isString())
      throw new CompilerError(
        "Cannot use dynamic properties on namespace macros",
      );
    const symbolName = this.changeCasing ? camelToDashCase(key.data) : key.data;

    // if (dynamicVars.includes(symbolName)) {
    //   return [
    //     new StoreValue(`@${symbolName}`, EMutability.readonly, {
    //       volatile: true,
    //     }),
    //     [],
    //   ];
    // }

    const out = c.createImmutableId();
    if (!dynamicVars.includes(symbolName)) {
      c.setValue(out, new StoreValue(`@${symbolName}`, EMutability.constant));
    } else {
      const globalId = c.createGlobalId();
      c.setValue(
        globalId,
        new StoreValue(`@${symbolName}`, EMutability.readonly),
      );
      cursor.addInstruction(new LoadInstruction(globalId, out, node));
    }

    return out;
  }

  hasProperty(c: ICompilerContext, prop: IValue): boolean {
    return prop instanceof LiteralValue && prop.isString();
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor() {
    super();
  }
}

export class ColorsNamespace extends NamespaceMacro {
  constructor() {
    super();
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
    if (!(key instanceof LiteralValue) || !key.isString())
      return super.get(c, cursor, targetId, propId, node);

    const plainName = key.data;

    const name = `@color${plainName[0].toUpperCase()}${plainName.slice(1)}`;
    return c.registerValue(new StoreValue(name, EMutability.constant));
  }
}

export class SoundsNamespace extends NamespaceMacro {
  constructor() {
    super();
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

    if (!(key instanceof LiteralValue) || !key.isString())
      return super.get(c, cursor, targetId, propId, node);

    const result = new StoreValue(`@sfx-${key.data}`, EMutability.constant);

    return c.registerValue(result);
  }
}
