import { assertIsObjectMacro, assertIsRuntimeValue } from "../../assertions";
import { InstructionBase } from "../../instructions";
import { EMutability } from "../../types";
import { SenseableValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnUnit extends MacroFunction {
  constructor() {
    super((scope, out, options) => {
      assertIsObjectMacro(options, "The options");

      const { type, x, y, team, rotation } = options.data;

      assertIsRuntimeValue(type, "type");
      assertIsRuntimeValue(x, "x");
      assertIsRuntimeValue(y, "y");
      assertIsRuntimeValue(team, "team");

      const output = SenseableValue.from(scope, out, EMutability.constant);

      return [
        output,
        [
          new InstructionBase(
            "spawn",
            type,
            x,
            y,
            rotation ?? "0",
            team,
            output
          ),
        ],
      ];
    });
  }
}
