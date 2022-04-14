import { es } from "./types";

/**
 * The prefix for internal variables inside the compiler output
 */
export const internalPrefix = "&";
export const discardedName = `${internalPrefix}_`;

/**
 * Returns a string that has the format: [line]:[column]
 */
export function nodeName(node: es.Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { line, column } = node.loc!.start;
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
