import { NativeInstruction } from "../../flow";
import { assertIsObjectMacro, assertObjectFields, nullId } from "../../utils";
import { MacroFunction } from "../Function";
import { filterIds } from "../util";

export class Explosion extends MacroFunction {
  constructor() {
    super((c, cursor, loc, optionsId) => {
      const options = c.getValue(optionsId);
      assertIsObjectMacro(options, "The options");

      const params = assertObjectFields(c, options, [
        "team",
        "x",
        "y",
        "radius",
        "damage",
        "air",
        "ground",
        "pierce",
      ]);

      cursor.addInstruction(
        new NativeInstruction(
          ["explosion", ...params],
          filterIds(params),
          [],
          loc,
        ),
      );
      return nullId;
    });
  }
}
