import { es, IInstruction, IScope, IValue, TValueInstructions } from "./types";

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

export function deepEval(
  scope: IScope,
  value: IValue,
  instructions: IInstruction[] = []
): TValueInstructions {
  let last: IValue | null = null;
  let current = value;

  while (current != last) {
    last = current;
    const [res, resInst] = current.eval(scope);
    current = res;
    instructions = [...instructions, ...resInst];
  }

  return [current, instructions];
}
