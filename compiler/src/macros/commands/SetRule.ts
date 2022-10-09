import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class SetRule extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      overloads: {
        currentWaveTime: { args: ["seconds"] },
        waveTimer: { args: ["enabled"] },
        waves: { args: ["enabled"] },
        wave: { args: ["number"] },
        waveSpacing: { args: ["seconds"] },
        waveSending: { args: ["enabled"] },
        attackMode: { args: ["enabled"] },
        enemyCoreBuildRadius: { args: ["radius"] },
        dropZoneRadius: { args: ["radius"] },
        unitCap: { args: ["cap"] },
        mapArea: { named: "options", args: ["x", "y", "width", "height"] },
        lighting: { args: ["enabled"] },
        ambientLight: { args: ["rgbaData"] },
        solarMultiplier: { args: ["multiplier"] },
        buildSpeed: { args: ["team", "multiplier"] },
        unitBuildSpeed: { args: ["team", "multiplier"] },
        unitDamage: { args: ["team", "multiplier"] },
        blockHealth: { args: ["team", "multiplier"] },
        blockDamage: { args: ["team", "multiplier"] },
        rtsMinWeight: { args: ["team", "value"] },
        rtsMinSquad: { args: ["team", "value"] },
      },
      handler(scope, overload, ...args) {
        const params: (IValue | string)[] = ["10", "0", "0", "100", "100"];
        switch (overload) {
          case "mapArea": {
            const [x, y, width, height] = args;
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
            const [team, value] = args;
            params[1] = team;
            params[2] = value;
            break;
          }
          default:
            params[0] = args[0]; // the general value
        }

        return [null, [new InstructionBase("setrule", overload, ...params)]];
      },
    });
    super(scope, data);
  }
}
