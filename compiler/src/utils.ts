import { es } from "./types";

/**
 * The prefix for internal variables inside the compiler output
 */
export const internalPrefix = "&";
export const discardedName = `${internalPrefix}_`;

export function nodeName(node: es.Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { line, column } = node.loc!.start;
  return `${line}:${column}`;
}

export function camelToDashCase(name: string) {
  return name.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
}

export function hoistFunctions(nodes: es.Node[]) {
  return nodes.sort(a =>
    a.type === "FunctionDeclaration" ? -1 : 0
  );
}