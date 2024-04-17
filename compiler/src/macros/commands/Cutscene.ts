import { ICompilerContext } from "../../CompilerContext";
import { InstructionBase } from "../../instructions";
import { nullId } from "../../utils";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Cutscene extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        pan: { named: "options", args: ["x", "y", "speed"] },
        zoom: { args: ["level"] },
        stop: { args: [] },
      },
      handler(c, overload, out, ...args) {
        const params = Object.assign(["100", "100", "0.06", "0"], args);
        c.setAlias(out, nullId);
        return [new InstructionBase("cutscene", overload, ...params)];
      },
    });
    super(data);
  }
}
