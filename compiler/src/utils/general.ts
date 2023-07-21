import { es } from "../types";

/**
 * Returns a string that has the format: [line]:[column].
 *
 * If `name` is provided, and it is a string, the resulting string will
 * have the format: [name]:[line]:[column].
 */
export function nodeName(node: es.Node, name?: false | string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { line, column } = node.loc!.start;
  if (typeof name === "string") return `${name}:${line}:${column}`;
  return `${line}:${column}`;
}

/**
 * Converts a camel case string into a dash case one.
 *
 * As an example `camelCase` becomes `camel-case`
 * @example
 * ```
 * camelToDashCase("camelCase") // returns "camel-case"
 * ```
 */
export function camelToDashCase(name: string) {
  return name.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
}

/**
 * A more type safe version of `Object.assign`
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function assign<T extends {}>(
  obj: T,
  props: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T as T[K] extends Function ? never : K]?: T[K];
  },
): T {
  return Object.assign(obj, props);
}

/** Lazily computes and caches an expression */
export function lazy<T>(fn: () => T) {
  let value: T;
  return () => (value ??= fn());
}
