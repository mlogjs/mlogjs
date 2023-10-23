import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Effect extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        warn: { args: ["x", "y"] },
        cross: { args: ["x", "y"] },
        blockFall: { args: ["x", "y", "data"] },
        placeBlock: { args: ["x", "y", "size"] },
        placeBlockSpark: { args: ["x", "y", "size"] },
        breakBlock: { args: ["x", "y", "size"] },
        spawn: { args: ["x", "y"] },
        trail: { args: ["x", "y", "color", "size"] },
        breakPop: { args: ["x", "y", "color", "size"] },
        smokeCloud: { args: ["x", "y", "color"] },
        vapor: { args: ["x", "y", "color"] },
        hit: { args: ["x", "y", "color"] },
        hitSquare: { args: ["x", "y", "color"] },
        shootSmall: { args: ["x", "y", "color", "rotation"] },
        shootBig: { args: ["x", "y", "color", "rotation"] },
        smokeSmall: { args: ["x", "y", "rotation"] },
        smokeBig: { args: ["x", "y", "rotation"] },
        smokeColor: { args: ["x", "y", "color", "rotation"] },
        smokeSquare: { args: ["x", "y", "color", "rotation"] },
        smokeSquareBig: { args: ["x", "y", "color", "rotation"] },
        spark: { args: ["x", "y", "color"] },
        sparkBig: { args: ["x", "y", "color"] },
        sparkShoot: { args: ["x", "y", "color", "rotation"] },
        sparkShootBig: { args: ["x", "y", "color", "rotation"] },
        drill: { args: ["x", "y", "color"] },
        drillBig: { args: ["x", "y", "color"] },
        lightBlock: { args: ["x", "y", "color", "size"] },
        explosion: { args: ["x", "y", "size"] },
        smokePuff: { args: ["x", "y", "color"] },
        sparkExplosion: { args: ["x", "y", "color"] },
        crossExplosion: { args: ["x", "y", "color", "size"] },
        wave: { args: ["x", "y", "color", "size"] },
        bubble: { args: ["x", "y"] },
      },
      handler(scope, overload, out, ...args) {
        const params: (string | IValue)[] = ["0", "0", "2", "%ffaaff", ""];
        params[0] = args[0];
        params[1] = args[1];
        switch (overload) {
          case "blockFall":
            params[4] = args[2];
            break;
          case "placeBlock":
          case "smokeSmall":
          case "smokeBig":
          case "explosion":
            params[2] = args[2];
            break;
          case "trail":
          case "breakPop":
          case "shootSmall":
          case "shootBig":
          case "smokeColor":
          case "smokeSquare":
          case "smokeSquareBig":
          case "sparkShoot":
          case "sparkShootBig":
          case "lightBlock":
          case "crossExplosion":
          case "wave":
            params[3] = args[2];
            params[2] = args[3];
            break;
          case "smokeCloud":
          case "vapor":
          case "hit":
          case "hitSquare":
          case "spark":
          case "sparkBig":
          case "drill":
          case "drillBig":
          case "smokePuff":
          case "sparkExplosion":
            params[3] = args[2];
            break;
        }
        return [null, [new InstructionBase("effect", overload, ...params)]];
      },
    });
    super(data);
  }
}
