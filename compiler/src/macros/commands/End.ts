import { EndInstruction } from "../../instructions";
import { MacroFunction } from "../Function";

export class End extends MacroFunction<null> {
  constructor() {
    super(() => [null, [new EndInstruction()]]);
  }
}
