import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { ImmutableId, NativeInstruction } from "../../flow";
import { EMutability, Location } from "../../types";

const defaultTargetName = "message1";
export class PrintFlush extends MacroFunction {
  constructor() {
    super((c, cursor, node, targetId) => {
      if (!targetId) {
        const defaultTarget = c.registerValue(
          new StoreValue(defaultTargetName, EMutability.constant),
        );
        cursor.addInstruction(
          new NativePrintFlushInstruction(defaultTarget, node),
        );
        return c.nullId;
      }

      const target = c.getValueOrTemp(targetId);

      if (!(target instanceof StoreValue))
        throw new CompilerError("The printflush target must be a store value");
      cursor.addInstruction(new NativePrintFlushInstruction(targetId, node));
      return c.nullId;
    });
  }
}

class NativePrintFlushInstruction extends NativeInstruction {
  constructor(target: ImmutableId, node: Location) {
    super(["printflush", target], [target], [], node);
  }
}
