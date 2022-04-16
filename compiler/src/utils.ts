import { OperationInstruction } from "./instructions";
import { InstructionBase } from "./instructions/InstructionBase";
import { es, IInstruction, IScope, IValue, TValueInstructions } from "./types";
import { LiteralValue, StoreValue, StackValue } from "./values";

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
  return nodes.sort(a => (a.type === "FunctionDeclaration" ? -1 : 0));
}

export function createTemp(scope: IScope): StoreValue {
  return scope.stacked ? new StackValue(scope) : new StoreValue(scope);
}

export function pushTemp(scope: IScope, temp: IValue): IInstruction[] {
  return [
    new InstructionBase("write", temp, scope.stackMemory, scope.stackPointer),
    new OperationInstruction(
      "add",
      scope.stackPointer,
      scope.stackPointer,
      new LiteralValue(scope, 1)
    ),
  ];
}

export function popTemp(scope: IScope): TValueInstructions {
  const temp = createTemp(scope);
  return [
    temp,
    [
      new OperationInstruction(
        "sub",
        scope.stackPointer,
        scope.stackPointer,
        new LiteralValue(scope, 1)
      ),
      new InstructionBase("read", temp, scope.stackMemory, scope.stackPointer),
    ],
  ];
}
