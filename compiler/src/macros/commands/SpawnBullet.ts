import { InstructionBase } from "../../instructions";
import { assertIsObjectMacro, assertIsRuntimeValue } from "../../utils";
import { StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnBullet extends MacroFunction {
  constructor() {
    super((scope, out, options) => {
      assertIsObjectMacro(options, "The options");

      const {
        from,
        index,
        x,
        y,
        rotation,
        team,
        owner,
        damage,
        velocityScl,
        lifeScl,
        aimX,
        aimY,
      } = options.data;

      assertIsRuntimeValue(from, "from");
      assertIsRuntimeValue(x, "x");
      assertIsRuntimeValue(y, "y");
      assertIsRuntimeValue(rotation, "rotation");
      assertIsRuntimeValue(team, "team");

      const output = StoreValue.from(scope, out);

      return [
        output,
        [
          new InstructionBase(
            "bullet",
            output,
            from,
            index ?? "0",
            x,
            y,
            rotation,
            team,
            owner ?? "null",
            damage ?? "-1",
            velocityScl ?? "1",
            lifeScl ?? "1",
            aimX ?? "-1",
            aimY ?? "-1",
          ),
        ],
      ];
    });
  }
}
