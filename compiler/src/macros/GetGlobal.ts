import { CompilerError } from "../CompilerError";
import { GlobalId, ImmutableId, LoadInstruction } from "../flow";
import { EMutability } from "../types";
import { LiteralValue, StoreValue } from "../values";
import { ComptimeMacroFunction } from "./Function";

export class GetGlobal extends ComptimeMacroFunction {
  constructor(public mutability: EMutability) {
    super((c, context, node, args) => {
      const name = c.getValue(args[0]);
      if (!(name instanceof LiteralValue) || !name.isString())
        throw new CompilerError("The name parameter must be a string literal.");

      const value = new StoreValue(name.data, this.mutability);
      switch (this.mutability) {
        case EMutability.constant:
        case EMutability.immutable:
          return c.registerValue(value);
        default: {
          const globalId = new GlobalId();
          const out = new ImmutableId();
          c.setValue(globalId, value);
          context.addInstruction(new LoadInstruction(globalId, out, node));
          return out;
        }
      }
    });
  }
}
