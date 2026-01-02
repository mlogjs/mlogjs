import { ICompilerContext } from "../../CompilerContext";
import { ImmutableId, NativeInstruction } from "../../flow";
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
      handler(c, overload, cursor, loc, index) {
        const out = c.createImmutableId();
        cursor.addInstruction(
          new NativeInstruction(
            ["lookup", overload, out, index],
            [index as ImmutableId],
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
