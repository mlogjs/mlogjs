import { MacroFunction } from "..";
import { StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { nullId } from "../../utils";
import { NativeInstruction } from "../../flow";

const defaultTargetName = "display1";

export class DrawFlush extends MacroFunction {
  constructor() {
    super((c, cursor, loc, targetId) => {
      if (!targetId) {
        cursor.addInstruction(
          new NativeInstruction(["drawflush", defaultTargetName], [], [], loc),
        );
        return nullId;
      }

      const target = c.getValueOrTemp(targetId);

      if (!(target instanceof StoreValue))
        throw new CompilerError("The drawflush target must be a store value");
      cursor.addInstruction(
        new NativeInstruction(["drawflush", targetId], [targetId], [], loc),
      );

      return nullId;
    });
  }
}
