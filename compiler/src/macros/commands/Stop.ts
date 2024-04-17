import { StopInstruction } from "../../flow";
import { nullId } from "../../utils";
import { MacroFunction } from "../Function";

export class Stop extends MacroFunction {
  constructor() {
    super((c, cursor, loc) => {
      cursor.discardFollowing();
      cursor.setEndInstruction(new StopInstruction(loc));
      return nullId;
    });
  }
}
