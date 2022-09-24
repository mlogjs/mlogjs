import { CompilerError } from "./CompilerError";
import { IValue } from "./types";
import { LiteralValue, ObjectValue, StoreValue } from "./values";

/** Asserts that `value` is a `LiteralValue` that contains a string */
export function assertStringLiteral(
  value: IValue | undefined,
  name: string
): asserts value is LiteralValue & { data: string } {
  if (!(value instanceof LiteralValue) || typeof value.data !== "string")
    throw new CompilerError(`${name} must be a string literal`);
}

/** Asserts that `value` is a string literal that is part of a given set of `members`*/
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

/** Asserts that `value` is either a store or a literal */
export function assertIsRuntimeValue(
  value: IValue | undefined,
  name: string
): asserts value is LiteralValue | StoreValue {
  if (!(value instanceof LiteralValue) && !(value instanceof StoreValue))
    throw new CompilerError(`${name} must be a valid runtime value`);
}

/** Asserts that `value` is an `ObjectValue` */
export function assertIsObjectMacro(
  value: IValue | undefined,
  name: string
): asserts value is ObjectValue {
  if (!(value instanceof ObjectValue))
    throw new CompilerError(`${name} must be an object macro`);
}

/** Asserts that `value` is an `ObjectValue` that has a length property */
export function assertIsArrayMacro(
  value: IValue | undefined,
  name: string
): asserts value is ObjectValue {
  if (!(value instanceof ObjectValue) || !value.data.length)
    throw new CompilerError(`${name} must be an array macro`);
}

/** Helper type used to describe the overloads of a macro function. See {@link assertObjectFields} */
export type TOverloadDescriptor<K extends string> = Record<
  K,
  (string | IParameterDescriptor)[]
>;

/** Describes an object destructuring paremeter. Generally used with `assertObjectFields` */
export interface IParameterDescriptor {
  key: string;
  name?: string;
  default?: string;
  /** Throw an error on invalid values */
  validate?(value: IValue): void;
}

/** Asserts that all of the fields described are present on `value`*/
export function assertObjectFields(
  value: ObjectValue,
  fields: (string | IParameterDescriptor)[]
): (IValue | string)[] {
  const result: (IValue | string)[] = [];

  for (const field of fields) {
    const param: IParameterDescriptor =
      typeof field === "object" ? field : { key: field };

    const item = value.data[param.key];

    if (item) {
      param.validate?.(item);
      result.push(item);
      continue;
    }

    if (param.default == undefined)
      throw new CompilerError(
        `The field "${param.name ?? param.key}" must be present`
      );

    result.push(param.default);
  }

  return result;
}