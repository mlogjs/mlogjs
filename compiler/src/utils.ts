import { es } from "./types";

/**
 * The prefix for internal variables inside the compiler output
 */
export const internalPrefix = "&";

export function nodeName(node: es.Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { line, column } = node.loc!.start;
  return `${line}:${column}`;
}

export function camelToDashCase(name: string) {
  return name.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
}
