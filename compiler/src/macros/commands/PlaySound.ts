import { ICompilerContext } from "../../CompilerContext";
import { ImmutableId, NativeInstruction } from "../../flow";
import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class PlaySound extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
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

      handler(c, overload, cursor, loc, ...args) {
        let sound: string | ImmutableId = "0";
        let volume: string | ImmutableId = "0";
        let pitch: string | ImmutableId = "0";
        let pan: string | ImmutableId = "0";
        let x: string | ImmutableId = "0";
        let y: string | ImmutableId = "0";
        let limit: string | ImmutableId = "0";

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

        cursor.addInstruction(
          new NativeInstruction(
            [
              "playsound",
              String(overload === "positional"),
              sound,
              volume,
              pitch,
              pan,
              x,
              y,
              limit,
            ],
            filterIds([sound, volume, pitch, pan, x, y, limit]),
            [],
            loc,
          ),
        );
        return c.nullId;
      },
    });
    super(data);
  }
}
