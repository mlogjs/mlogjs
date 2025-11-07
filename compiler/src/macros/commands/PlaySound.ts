import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class PlaySound extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        positional: {
          named: "options",
          args: ["sound", "volume", "pitch", "x", "y", "limit"],
        },
        global: {
          named: "options",
          args: ["sound", "volume", "pitch", "pan", "limit"],
        },
      },
      //playsound false @sfx-pew 12 0.1 globalyespan @thisx @thisy true
      // wait 1

      handler(scope, overload, out, ...args) {
        let sound: string | IValue = "0";
        let volume: string | IValue = "0";
        let pitch: string | IValue = "0";
        let pan: string | IValue = "0";
        let x: string | IValue = "0";
        let y: string | IValue = "0";
        let limit: string | IValue = "0";

        // let volume =
        switch (overload) {
          case "positional": {
            // playsound true id volume pitch _pan x y limit
            [sound, volume, pitch, x, y, limit] = args;
            break;
          }
          case "global": {
            // playsound false id volume pitch pan _x _y limit
            [sound, volume, pitch, pan, limit] = args;
            break;
          }
        }
        return [
          null,
          [
            new InstructionBase(
              "playsound",
              String(overload === "positional"),
              sound,
              volume,
              pitch,
              pan,
              x,
              y,
              limit,
            ),
          ],
        ];
      },
    });
    super(data);
  }
}
