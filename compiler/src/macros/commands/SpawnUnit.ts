import { NativeInstruction } from "../../flow";
import { assertIsObjectMacro, assertObjectFields } from "../../utils";
import { MacroFunction } from "../Function";
import { filterIds } from "../util";

export class SpawnUnit extends MacroFunction {
  constructor() {
    super((c, cursor, loc, optionsId) => {
      const options = c.getValue(optionsId);
      assertIsObjectMacro(options, "The options");

      const [type, x, y, team, rotation] = assertObjectFields(c, options, [
        "type",
        "x",
        "y",
        "team",
        { key: "rotation", default: "0" },
      ]);

      const out = c.createImmutableId();
      const params = [type, x, y, team, rotation ?? "0"];
      cursor.addInstruction(
        new NativeInstruction(
          ["spawn", ...params, out],
          filterIds(params),
          [out],
          loc,
        ),
      );

      return out;
    });
  }
}
