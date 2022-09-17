import { CompilerError } from "../CompilerError";
import { IValue } from "../types";
import { LiteralValue } from "../values";

export function assertStringLiteral(
  value: IValue,
  name: string
): asserts value is LiteralValue & { data: string } {
  if (!(value instanceof LiteralValue) || typeof value.data !== "string")
    throw new CompilerError(`${name} must be a string literal`);
}

export function assertLiteralOneOf<T extends readonly string[]>(
  value: IValue,
  members: T,
  name: string
): asserts value is LiteralValue & { data: T[number] } {
  assertStringLiteral(value, name);
  if (!members.includes(value.data))
    throw new CompilerError(
      `${name} must be one of: ${members
        .slice(0, -1)
        .map(member => `"${member}"`)
        .join(", ")} or "${members[members.length - 1]}"`
    );
}
