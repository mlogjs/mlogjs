import { CompilerError } from "./CompilerError";
import { IValue } from "./types";
import { LiteralValue, ObjectValue, StoreValue } from "./values";

export function assertStringLiteral(
  value: IValue | undefined,
  name: string
): asserts value is LiteralValue & { data: string } {
  if (!(value instanceof LiteralValue) || typeof value.data !== "string")
    throw new CompilerError(`${name} must be a string literal`);
}

export function assertLiteralOneOf<T extends readonly string[]>(
  value: IValue | undefined,
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

export function assertIsRuntimeValue(
  value: IValue | undefined,
  name: string
): asserts value is LiteralValue | StoreValue {
  if (!(value instanceof LiteralValue) || !(value instanceof StoreValue))
    throw new CompilerError(`${name} must be a valid runtime value`);
}

export function assertIsObjectMacro(
  value: IValue | undefined,
  name: string
): asserts value is ObjectValue {
  if (!(value instanceof ObjectValue))
    throw new CompilerError(`${name} must be an object macro`);
}
