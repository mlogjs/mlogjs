import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { Location } from "../types";
import { LiteralValue } from "../values";
import { ImmutableId } from "./id";
import { BinaryOperationInstruction } from "./instructions";

/**
 * Add a `value == 0` instruction using the cursor to get the negated version of
 * a value.
 *
 * Used by the handlers of if, for, while and do while statements to have a
 * better starting control flow block order.
 */
export function negateValue(
  c: ICompilerContext,
  cursor: IBlockCursor,
  value: ImmutableId,
  node?: Location,
) {
  const out = new ImmutableId();
  cursor.addInstruction(
    new BinaryOperationInstruction(
      "equal",
      value,
      c.registerValue(new LiteralValue(0)),
      out,
      node,
    ),
  );
  return out;
}
