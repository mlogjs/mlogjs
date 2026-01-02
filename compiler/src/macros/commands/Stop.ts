import { StopInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class Stop extends MacroFunction {
  constructor() {
    super((c, cursor, loc) => {
      cursor.discardFollowing();
      cursor.setEndInstruction(new StopInstruction(loc));
      return c.nullId;
    });
  }
}
