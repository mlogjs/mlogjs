import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import { es, IScope, THandler, IValue } from "./types";
import { CompilerOptions } from "./Compiler";
import { HandlerContext } from "./HandlerContext";
import { nullId } from "./utils";
import { ConstBindInstruction } from "./flow";
import { LiteralValue, StoreValue } from "./values";

export interface ICompilerContext {
  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  generateId(): number;

  getValueName(id: number): string | undefined;
  setValueName(id: number, name: string): void;
  getValueId(name: string): number | undefined;

  getValue(id: number): IValue | undefined;
  setValue(id: number, value: IValue): void;
  registerValue(value: IValue): number;
  resolveTypes(): void;

  handle(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): number;

  handleCopy(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): number;

  /**
   * Handles many nodes in order.
   *
   * The usage of this method over a regular loop over an array of nodes is only
   * required if the code inside the loop generates instructions that are not
   * tracked by the compiler handler methods ({@link handle}, {@link handleEval}
   * and {@link handleMany})
   */
  handleMany<T extends es.Node>(
    scope: IScope,
    handlerContext: HandlerContext,
    nodes: T[],
    handler?: (node: T) => number,
  ): number;
}

export class CompilerContext implements ICompilerContext {
  protected handlers: Partial<Record<es.Node["type"], THandler>> = handlers;
  // 0 is reserved for LiteralValue(null)
  #idCounter = 1;
  #names = new Map<number, string>();
  #ids = new Map<string, number>();
  #values = new Map<number, IValue>();

  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  constructor({
    compactNames = false,
    sourcemap = false,
  }: Required<CompilerOptions>) {
    this.compactNames = compactNames;
    this.sourcemap = sourcemap;
    this.setValue(nullId, new LiteralValue(null));
  }
  getValue(id: number): IValue | undefined {
    return this.#values.get(id);
  }
  setValue(id: number, value: IValue): void {
    this.#values.set(id, value);
  }

  registerValue(value: IValue): number {
    const id = this.generateId();
    this.#values.set(id, value);
    return id;
  }

  generateId(): number {
    return this.#idCounter++;
  }

  getValueName(id: number): string | undefined {
    return this.#names.get(id);
  }

  setValueName(id: number, name: string): void {
    this.#names.set(id, name);
    this.#ids.set(name, id);
  }

  getValueId(name: string): number | undefined {
    return this.#ids.get(name);
  }

  resolveTypes(): void {
    let tempCount = 0;
    for (let i = 0; i < this.#idCounter; i++) {
      const value = this.#values.get(i);
      if (!value) this.#values.set(i, new StoreValue(`&t${tempCount++}`));
    }
  }

  handle(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): number {
    try {
      if (!handler) throw new CompilerError("Missing handler for " + node.type);
      const result = handler(this, scope, handlerContext, node, arg);
      // if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  handleCopy(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): number {
    const value = this.handle(scope, handlerContext, node, handler, arg);
    // const copy = this.generateId();
    // handlerContext.addInstruction(new ConstBindInstruction(copy, value, node));
    return value;
  }

  /**
   * Handles many nodes in order.
   *
   * The usage of this method over a regular loop over an array of nodes is only
   * required if the code inside the loop generates instructions that are not
   * tracked by the compiler handler methods ({@link handle}, {@link handleEval}
   * and {@link handleMany})
   */
  handleMany<T extends es.Node>(
    scope: IScope,
    handlerContext: HandlerContext,
    nodes: T[],
    handler?: (node: T) => number,
  ): number {
    for (const node of hoistedFunctionNodes(nodes)) {
      this.handle(
        scope,
        handlerContext,
        node,
        handler && (() => handler(node)),
      );
    }
    return nullId;
  }
}

function* hoistedFunctionNodes<T extends es.Node>(nodes: T[]) {
  // sorting is O(n long n) while this is just O(n)
  // besides, it's better not to modify the node array
  for (const node of nodes) {
    if (node.type === "FunctionDeclaration") {
      yield node;
    }
  }

  for (const node of nodes) {
    if (node.type !== "FunctionDeclaration") {
      yield node;
    }
  }
}
