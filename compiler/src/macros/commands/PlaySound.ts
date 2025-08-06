import { InstructionBase } from "../../instructions";
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
        const params = ["0", "0", "0", "0", "0", "0"];
        let sound = "0";
        // let volume =
        switch (overload) {
          case "positional":
            params[0] = "true";

            break;
          case "global":
            params[0] = "false";
          // playsound false sound_id volume pitch pan _x _y limit
        }
        return [
          null,
          [
            new InstructionBase(
              "playsound",
              String(overload === "positional"),
              ...args,
            ),
          ],
        ];
      },
    });
    super(data);
  }
}
