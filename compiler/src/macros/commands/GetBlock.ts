import { ICompilerContext } from "../../CompilerContext";
import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class GetBlock extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        floor: { args: ["x", "y"] },
        ore: { args: ["x", "y"] },
        block: { args: ["x", "y"] },
        building: { args: ["x", "y"] },
      },
      handler(c, overload, out, x, y) {
        const output = c.getValueOrTemp(out);
        return [new InstructionBase("getblock", overload, output, x, y)];
      },
    });
    super(data);
  }
}
