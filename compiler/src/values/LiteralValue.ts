import {
  IScope,
  IBindableValue,
  TLiteral,
  TValueInstructions,
  IValue,
  EMutability,
} from "../types";
import { BaseValue } from ".";
import { CompilerError } from "../CompilerError";
import { mathConstants } from "../utils";
import { ICompilerContext } from "../CompilerContext";
import { ImmutableId } from "../flow";
import { IBlockCursor } from "../BlockCursor";
import { SourceRange } from "../SourceRange";

const literalMethods: Record<
  string,
  (this: LiteralValue<TLiteral | null>, c: ICompilerContext) => LiteralValue
> = {
  length: function (this: LiteralValue<TLiteral | null>) {
    if (!this.isString())
      throw new CompilerError(
        "Length method only works on string literal values.",
      );
    return new LiteralValue(this.data.length);
  },
};

export class LiteralValue<T extends TLiteral | null = TLiteral>
  extends BaseValue
  implements IBindableValue<T>
{
  name: string;
  data: T;
  mutability = EMutability.constant;
  constructor(data: T) {
    super();
    this.data = data;
    this.name = JSON.stringify(this.data);
  }
  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }
  toMlogString() {
    const { data } = this;

    // math constants are literal values
    // so that the compiler can optimize them
    // in operations
    // this helps to print them in their global variable form
    // instead of their literal value
    switch (data) {
      case mathConstants.E:
        return "@e";
      case mathConstants.PI:
        return "@pi";
      case mathConstants.degToRad:
        return "@degToRad";
      case mathConstants.radToDeg:
        return "@radToDeg";
    }
    if (typeof data !== "string") return JSON.stringify(data);

    // this special handling is required because of
    // how mindustry parses string literals in logic statements

    // replace double quotes by two single quotes before
    // forming the json string
    // (there is no way to escape a " character)
    return JSON.stringify(data.replace(/"/g, "''")).replace(/\\\\/g, "\\"); // "unescape" backslashes
  }
  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    nameId: ImmutableId,
    loc: SourceRange,
  ): ImmutableId {
    const name = c.getValue(nameId);
    if (!(name instanceof LiteralValue && name.isString()))
      return super.get(c, cursor, targetId, nameId, loc);

    if (!Object.prototype.hasOwnProperty.call(literalMethods, name.data))
      throw new CompilerError(
        `The member [${name.debugString()}] does not exist on literal values.`,
      );
    const method = literalMethods[name.data];
    const out = c.createImmutableId();
    c.setValue(out, method.apply(this, [c]));
    return out;
  }

  hasProperty(compilerContext: ICompilerContext, prop: IValue): boolean {
    if (this.isString() && prop instanceof LiteralValue && prop.isString())
      return Object.prototype.hasOwnProperty.call(literalMethods, prop.data);
    return false;
  }

  get num(): number {
    if (this.data === null) return 0;
    if (typeof this.data === "string") return 1;
    return this.data;
  }

  isString(): this is LiteralValue<string> {
    return typeof this.data === "string";
  }

  isNumber(): this is LiteralValue<number> {
    return typeof this.data === "number";
  }

  debugString(): string {
    return this.toMlogString();
  }
}
