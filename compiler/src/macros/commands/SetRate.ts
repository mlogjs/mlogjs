import { NativeInstruction } from "../../flow";
import { nullId } from "../../utils";
import { MacroFunction } from "../Function";

export class SetRate extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ipt) => {
      cursor.addInstruction(
        new NativeInstruction(["setrate", ipt], [ipt], [], loc),
      );
      return nullId;
    });
  }
}
