import { ICompilerContext } from "../../CompilerContext";
import { isImmutableId, NativeInstruction } from "../../flow";
import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

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
      handler(c, overload, cursor, loc, x, y) {
        const out = c.createImmutableId();
        // const output = c.getValueOrTemp(out);
        // return [new InstructionBase("getblock", overload, output, x, y)];
        cursor.addInstruction(
          new NativeInstruction(
            ["getblock", overload, out, x, y],
            filterIds([x, y]),
            [out],
            loc,
          ),
        );
        return out;
      },
    });
    super(data);
  }
}
