import { ICompilerContext } from "../../CompilerContext";
import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class Lookup extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        block: { args: ["index"] },
        unit: { args: ["index"] },
        item: { args: ["index"] },
        liquid: { args: ["index"] },
        team: { args: ["index"] },
      },
      handler(c, overload, out, index) {
        const output = c.getValueOrTemp(out);
        return [new InstructionBase("lookup", overload, output, index)];
      },
    });
    super(data);
  }
}
