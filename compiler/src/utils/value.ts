import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { ImmutableId } from "../flow";
import { IValue, TEOutput } from "../types";
import {
  DestructuringValue,
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  StoreValue,
} from "../values";
import { discardedName } from "./constants";

export function isTemplateObjectArray(
  c: ICompilerContext,
  value: IValue | undefined,
): value is ObjectValue & {
  data: IObjectValueData & {
    raw: ObjectValue & {
      data: IObjectValueData & {
        length: LiteralValue<number>;
      };
    };
    length: LiteralValue<number>;
  };
} {
  if (!(value instanceof ObjectValue)) return false;
  const length = c.getValue(value.data.length);
  if (!(length instanceof LiteralValue) || !length.isNumber()) return false;
  const raw = c.getValue(value.data.raw);
  if (!(raw instanceof ObjectValue)) return false;
  const rawLength = c.getValue(raw.data.length);
  return rawLength instanceof LiteralValue && rawLength.isNumber();
}

export function extractOutName(out: TEOutput | undefined) {
  if (!out || typeof out === "string") return out;
  return out.name;
}

export function extractDestrucuringOut(
  out: TEOutput | undefined,
  field: string | number,
) {
  if (isDiscardedOut(out)) return discardedName;
  if (!(out instanceof DestructuringValue)) return;
  return out.fields[field] ?? discardedName;
}

/** Asserts that `value` is a `LiteralValue` that contains a string */
export function assertStringLiteral(
  value: IValue | undefined,
  name: string,
): asserts value is LiteralValue<string> {
  if (!(value instanceof LiteralValue) || !value.isString())
    throw new CompilerError(`${name} must be a string literal`);
}

/**
 * Asserts that `value` is a string literal that is part of a given set of
 * `members`
 */
export function assertLiteralOneOf<T extends readonly string[]>(
  value: IValue | undefined,
  members: T,
  name: string,
): asserts value is LiteralValue<T[number]> {
  assertStringLiteral(value, name);
  if (!members.includes(value.data))
    throw new CompilerError(
      `${name} must be one of: ${members
        .slice(0, -1)
        .map(member => `"${member}"`)
        .join(", ")} or "${members[members.length - 1]}"`,
    );
}

/** Asserts that `value` is either a store or a literal */
export function assertIsRuntimeValue(
  value: IValue | undefined,
  name: string,
): asserts value is LiteralValue | StoreValue {
  if (!(value instanceof LiteralValue) && !(value instanceof StoreValue))
    throw new CompilerError(`${name} must be a valid runtime value`);
}

/** Asserts that `value` is an `ObjectValue` */
export function assertIsObjectMacro(
  value: IValue | undefined,
  name: string,
): asserts value is ObjectValue {
  if (!(value instanceof ObjectValue))
    throw new CompilerError(`${name} must be an object macro`);
}

/** Asserts that `value` is an `ObjectValue` that has a length property */
export function assertIsArrayMacro(
  c: ICompilerContext,
  value: IValue | undefined,
  name: string,
): asserts value is ObjectValue & {
  data: {
    length: ImmutableId;
  };
} {
  if (value instanceof ObjectValue) {
    const length = c.getValue(value.data.length);
    if (length instanceof LiteralValue && length.isNumber()) return;
  }

  throw new CompilerError(`${name} must be an array macro`);
}

/**
 * Helper type used to describe the overloads of a macro function. See
 * {@link assertObjectFields}
 */
export type TOverloadDescriptor<K extends string> = Record<
  K,
  (string | IParameterDescriptor)[]
>;

/**
 * Describes an object destructuring paremeter. Generally used with
 * `assertObjectFields`
 */
export interface IParameterDescriptor {
  key: string;
  name?: string;
  default?: string;
  /** Throw an error on invalid values */
  validate?(value: IValue): void;
}

/** Asserts that all of the fields described are present on `value` */
export function assertObjectFields(
  c: ICompilerContext,
  value: ObjectValue,
  fields: (string | IParameterDescriptor)[],
): (ImmutableId | string)[] {
  const result: (ImmutableId | string)[] = [];

  for (const field of fields) {
    const param: IParameterDescriptor =
      typeof field === "object" ? field : { key: field };

    const itemId = value.data[param.key];
    const item = c.getValue(value.data[param.key]);

    if (item) {
      param.validate?.(item);
      result.push(itemId);
      continue;
    }

    if (param.default == undefined)
      throw new CompilerError(
        `The field "${param.name ?? param.key}" must be present`,
      );

    result.push(param.default);
  }

  return result;
}

export function isDiscardedOut(out: TEOutput | undefined) {
  if (!out) return false;
  if (typeof out === "string") return out === discardedName;
  return out.name === discardedName;
}
