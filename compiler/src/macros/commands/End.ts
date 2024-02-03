import { EndInstruction } from "../../flow";
import { nullId } from "../../utils";
import { ComptimeMacroFunction } from "../Function";

export class End extends ComptimeMacroFunction {
  constructor() {
    super((c, context, node) => {
      context.setEndInstruction(new EndInstruction(node));
      return nullId;
    });
  }
}
