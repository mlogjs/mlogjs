import { InstructionBase } from "../../instructions";
import { assertIsObjectMacro, assertObjectFields } from "../../utils";
import { MacroFunction } from "../Function";

export class Explosion extends MacroFunction<null> {
  constructor() {
    super((scope, out, options) => {
      assertIsObjectMacro(options, "The options");

      const params = assertObjectFields(options, [
        "team",
        "x",
        "y",
        "radius",
        "damage",
        "air",
        "ground",
        "pierce",
      ]);

      return [null, [new InstructionBase("explosion", ...params)]];
    });
  }
}
