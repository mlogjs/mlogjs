import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import {
  es,
  IScope,
  THandler,
  IValue,
  TDeclarationKind,
  IWriteableHandler,
} from "./types";
import { CompilerOptions } from "./Compiler";
import { LiteralValue, StoreValue } from "./values";
import { GlobalId, ImmutableId, ValueId } from "./flow/id";
import { IBlockCursor } from "./BlockCursor";

export interface ICompilerContext {
  readonly compactNames: boolean;
  readonly sourcemap: boolean;
  readonly nullId: ImmutableId;

  createImmutableId(): ImmutableId;
  createGlobalId(): GlobalId;
  getValueName(id: ValueId): string | undefined;
  setValueName(id: ValueId, name: string): void;
  getValueId(name: string): ValueId | undefined;

  getValue(id: ValueId | undefined): IValue | undefined;
  getValueOrTemp(id: ValueId): IValue;
  setValue(id: ValueId, value: IValue): void;
  registerValue(value: IValue): ImmutableId;
  setAlias(alias: ImmutableId, original: ImmutableId): void;
  setGlobalAlias(alias: ImmutableId, original: GlobalId): void;

  handle(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): ImmutableId;

  handleWriteable(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): IWriteableHandler;

  handleDeclaration(
    scope: IScope,
    cursor: IBlockCursor,
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
    cursor: IBlockCursor,
    nodes: T[],
    handler?: (node: T) => ValueId,
  ): ImmutableId;
}

export class CompilerContext implements ICompilerContext {
  protected handlers: Partial<Record<es.Node["type"], THandler>> = handlers;
  #tempCounter = 0;
  #idCounter = 0;
  #names = new Map<number, string>();
  #ids = new Map<string, ValueId>();
  #values = new Map<number, IValue>();

  readonly compactNames: boolean;
  readonly sourcemap: boolean;
  readonly nullId: ImmutableId;

  constructor({
    compactNames = false,
    sourcemap = false,
  }: Required<CompilerOptions>) {
    this.compactNames = compactNames;
    this.sourcemap = sourcemap;

    this.nullId = this.registerValue(new LiteralValue(null));
  }

  createImmutableId() {
    return new ImmutableId(this.#idCounter++);
  }

  createGlobalId() {
    return new GlobalId(this.#idCounter++);
  }

  getValue(id: ValueId | undefined): IValue | undefined {
    if (!id) return;
    return this.#values.get(id.number);
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
    this.#values.set(id.number, value);
  }

  registerValue(value: IValue): ImmutableId {
    const id = this.createImmutableId();
    this.#values.set(id.number, value);
    return id;
  }

  setAlias(alias: ImmutableId, original: ImmutableId): void {
    // prevents losing the names of const-declared variables
    if (this.#names.has(alias.number) && !this.#names.has(original.number)) {
      this.setValueName(original, this.getValueName(alias)!);
    }
    alias.number = original.number;
  }

  setGlobalAlias(alias: ImmutableId, original: GlobalId): void {
    alias.number = original.number;
  }

  getValueName(id: ValueId): string | undefined {
    return this.#names.get(id.number);
  }

  setValueName(id: ValueId, name: string): void {
    this.#names.set(id.number, name);
    this.#ids.set(name, id);
  }

  getValueId(name: string): ValueId | undefined {
    return this.#ids.get(name);
  }

  handle(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): ImmutableId {
    try {
      if (!handler) throw new CompilerError("Missing handler for " + node.type);
      const result = handler(this, scope, cursor, node, arg);
      // if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  handleWriteable(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): IWriteableHandler {
    try {
      if (!handler?.handleWriteable)
        throw new CompilerError("Missing handler for " + node.type);
      const result = handler.handleWriteable(this, scope, cursor, node, arg);
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
    cursor: IBlockCursor,
    node: es.Node,
    kind: TDeclarationKind,
    init?: ImmutableId,
    handler = this.handlers[node.type],
  ): void {
    try {
      if (!handler?.handleDeclaration)
        throw new CompilerError("Missing handler for " + node.type);
      handler.handleDeclaration(this, scope, cursor, node, kind, init);
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
    cursor: IBlockCursor,
    nodes: T[],
    handler?: (node: T) => ImmutableId,
  ): ImmutableId {
    for (const node of hoistedFunctionNodes(nodes)) {
      this.handle(scope, cursor, node, handler && (() => handler(node)));
    }
    return this.nullId;
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
