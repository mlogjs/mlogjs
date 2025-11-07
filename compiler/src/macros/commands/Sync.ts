import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { EMutability, IInstruction, IScope, TEOutput } from "../../types";
import { pipeInsts } from "../../utils";
import { LiteralValue, ObjectValue, StoreValue } from "../../values";
import { MacroFunction } from "../Function";

class SyncLock extends ObjectValue {
  constructor(public value: StoreValue) {
    super({
      value,
      sendToClients: new MacroFunction(() => {
        return [null, [new InstructionBase("sync", this.value)]];
      }),
    });
  }
}

export class SyncLockConstructor extends MacroFunction {
  constructor() {
    super((scope, out, init) => {
      const inst: IInstruction[] = [];
      const value = StoreValue.from(scope, out, EMutability.mutable);

      if (init) {
        if (!(init instanceof StoreValue || init instanceof LiteralValue)) {
          throw new CompilerError("Expected a store value or a literal value");
        }

        pipeInsts(value["="](scope, init), inst);
      }

      return [new SyncLock(value), inst];
    });
  }

  preCall(scope: IScope, out?: TEOutput): readonly TEOutput[] | undefined {
    if (out) return [out];
  }
}
