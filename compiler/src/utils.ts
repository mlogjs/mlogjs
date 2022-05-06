import { es } from "./types";

/**
 * The prefix for internal variables inside the compiler output
 */
export const internalPrefix = "&";
export const discardedName = `${internalPrefix}_`;

/**
 * Returns a string that has the format: [line]:[column].
 *
 * If `name` is provided, and it is a string, the resulting string will
 * have the format: [name]@[line]:[column].
 */
export function nodeName(node: es.Node, name?: false | string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { line, column } = node.loc!.start;
  if (typeof name === "string") return `${name}@${line}:${column}`;
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

export const itemNames = [
  "copper",
  "lead",
  "metaglass",
  "graphite",
  "sand",
  "coal",
  "titanium",
  "thorium",
  "scrap",
  "silicon",
  "plastanium",
  "phaseFabric",
  "surgeAlloy",
  "sporePod",
  "blastCompound",
  "pyratite",
];
