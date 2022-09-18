import { assertLiteralOneOf } from "../../assertions";
import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import { MacroFunction } from "../Function";

const validRules = [
  "currentWaveTime",
  "waveTimer",
  "waves",
  "wave",
  "waveSpacing",
  "waveSending",
  "attackMode",
  "enemyCoreBuildRadius",
  "dropZoneRadius",
  "unitCap",
  "mapArea",
  "lighting",
  "ambientLight",
  "solarMultiplier",
  "buildSpeed",
  "unitBuildSpeed",
  "unitDamage",
  "blockHealth",
  "blockDamage",
  "rtsMinWeight",
  "rtsMinSquad",
] as const;

const validLengths = [2, 3, 5];
const instName = "setrule";

export class SetRule extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (...args) => {
      if (!validLengths.includes(args.length)) {
        throw new CompilerError(
          `Expected 2, 3 or 5 arguments, received ${args.length}`
        );
      }
      const [rule] = args;

      assertLiteralOneOf(rule, validRules, "The rule");

      const params: (IValue | string)[] = ["10", "0", "0", "100", "100"];
      switch (rule.data) {
        case "mapArea": {
          const [, x, y, width, height] = args;
          params[1] = x;
          params[2] = y;
          params[3] = width;
          params[4] = height;
          break;
        }
        case "buildSpeed":
        case "unitBuildSpeed":
        case "unitDamage":
        case "blockHealth":
        case "blockDamage":
        case "rtsMinWeight":
        case "rtsMinSquad": {
          const [, team, value] = args;
          params[1] = team;
          params[2] = value;
          break;
        }
        default:
          params[0] = args[1]; // the general value
      }

      return [null, [new InstructionBase(instName, rule.data, ...params)]];
    });
  }
}
