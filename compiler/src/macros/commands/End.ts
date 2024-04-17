import { EndInstruction } from "../../flow";
import { nullId } from "../../utils";
import { MacroFunction } from "../Function";

export class End extends MacroFunction {
  constructor() {
    super((c, cursor, node) => {
      cursor.discardFollowing();
      cursor.setEndInstruction(new EndInstruction(node));
      return nullId;
    });
  }
}
