import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import {
  es,
  IScope,
  THandler,
  IValue,
  TWriteCallback,
  TDeclarationKind,
} from "./types";
import { CompilerOptions } from "./Compiler";
import { HandlerContext } from "./HandlerContext";
import { nullId } from "./utils";
import { Block } from "./flow";
import { LiteralValue, StoreValue } from "./values";
import { ImmutableId, ValueId } from "./flow/id";

export interface ICompilerContext {
  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  getValueName(id: ValueId): string | undefined;
  setValueName(id: ValueId, name: string): void;
  getValueId(name: string): ValueId | undefined;

  getValue(id: ValueId): IValue | undefined;
  getValueOrTemp(id: ValueId): IValue;
  setValue(id: ValueId, value: IValue): void;
  registerValue(value: IValue): ImmutableId;

  handle(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): ImmutableId;

  handleWrite(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): TWriteCallback;

  handleDeclaration(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    kind: TDeclarationKind,
    init?: ImmutableId,
    handler?: THandler,
  ): void;

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
    handler?: (node: T) => ValueId,
  ): ImmutableId;
}

export class CompilerContext implements ICompilerContext {
  protected handlers: Partial<Record<es.Node["type"], THandler>> = handlers;
  // 0 is reserved for LiteralValue(null)
  #tempCounter = 1;
  #names = new Map<ValueId, string>();
  #ids = new Map<string, ValueId>();
  #values = new Map<ValueId, IValue>();

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
  getValue(id: ValueId): IValue | undefined {
    return this.#values.get(id);
  }

  getValueOrTemp(id: ValueId): IValue {
    const value = this.getValue(id);
    if (value) return value;

    const name = this.getValueName(id);
    const store = new StoreValue(name ?? `&t${this.#tempCounter++}`);
    this.setValue(id, store);
    return store;
  }
  setValue(id: ValueId, value: IValue): void {
    this.#values.set(id, value);
  }

  registerValue(value: IValue): ImmutableId {
    const id = new ImmutableId();
    this.#values.set(id, value);
    return id;
  }

  getValueName(id: ValueId): string | undefined {
    return this.#names.get(id);
  }

  setValueName(id: ValueId, name: string): void {
    this.#names.set(id, name);
    this.#ids.set(name, id);
  }

  getValueId(name: string): ValueId | undefined {
    return this.#ids.get(name);
  }

  handle(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): ImmutableId {
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

  handleWrite(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): TWriteCallback {
    try {
      if (!handler?.handleWrite)
        throw new CompilerError("Missing handler for " + node.type);
      const result = handler.handleWrite(
        this,
        scope,
        handlerContext,
        node,
        arg,
      );
      // if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  handleDeclaration(
    scope: IScope,
    handlerContext: HandlerContext,
    node: es.Node,
    kind: TDeclarationKind,
    init?: ImmutableId,
    handler = this.handlers[node.type],
  ): void {
    try {
      if (!handler?.handleDeclaration)
        throw new CompilerError("Missing handler for " + node.type);
      handler.handleDeclaration(this, scope, handlerContext, node, kind, init);
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
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
    handler?: (node: T) => ImmutableId,
  ): ImmutableId {
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
