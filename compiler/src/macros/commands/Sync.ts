import { IBlockCursor } from "../../BlockCursor";
import { ICompilerContext } from "../../CompilerContext";
import {
  GlobalId,
  ImmutableId,
  LoadInstruction,
  NativeInstruction,
  StoreInstruction,
} from "../../flow";
import { SourceRange } from "../../SourceRange";
import { IScope, TEOutput } from "../../types";
import { LiteralValue, ObjectValue } from "../../values";
import { MacroFunction } from "../Function";

class SyncLock extends ObjectValue {
  constructor(
    c: ICompilerContext,
    public value: GlobalId,
  ) {
    super(
      ObjectValue.autoRegisterData(c, {
        sendToClients: new MacroFunction((c, cursor, loc) => {
          const temp = c.createImmutableId();
          // TODO: find a better way to do this
          // this is a big hack to make native instruction take a global id as input
          c.setGlobalAlias(temp, this.value);
          cursor.addInstruction(new LoadInstruction(this.value, temp, loc));
          cursor.addInstruction(
            new NativeInstruction(["sync", temp], [temp], [], loc),
          );
          return c.nullId;
        }),
      }),
    );
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    loc: SourceRange,
  ): ImmutableId {
    const key = c.getValue(propId);
    if (key instanceof LiteralValue && key.data === "value") {
      const out = c.createImmutableId();
      cursor.addInstruction(new LoadInstruction(this.value, out, loc));
      return out;
    }
    return super.get(c, cursor, targetId, propId, loc);
  }
}

export class SyncLockConstructor extends MacroFunction {
  constructor() {
    super((c, cursor, loc, init) => {
      const value = c.createGlobalId();

      // if (init) {
      //   if (!(init instanceof StoreValue || init instanceof LiteralValue)) {
      //     throw new CompilerError("Expected a store value or a literal value");
      //   }

      //   pipeInsts(value["="](scope, init), inst);
      // }
      cursor.addInstruction(new StoreInstruction(value, init, loc));

      return c.registerValue(new SyncLock(c, value));
    });
  }

  preCall(scope: IScope, out?: TEOutput): readonly TEOutput[] | undefined {
    if (out) return [out];
  }
}
