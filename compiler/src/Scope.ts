import { StoreValue } from "./values";
import { AddressResolver } from "./instructions";
import {
  IFunctionValue,
  IInstruction,
  INamedValue,
  IScope,
  IValue,
} from "./types";
import { CompilerError } from "./CompilerError";
import { internalPrefix } from "./utils";

export class Scope implements IScope {
  data: Record<string, IValue | null>;
  break!: AddressResolver;
  continue!: AddressResolver;
  function!: IFunctionValue;
  label?: string;
  // Only `unchecked` is supposed to change this
  checkIndexes = true;
  // set by the compiler options
  shortCircuitOperators = true;

  constructor(
    values: Record<string, IValue | null>,
    public parent: IScope | null = null,
    public ntemp = 0,
    public name = "",
    public inst: IInstruction[] = [],
    public operationCache: Record<string, IValue> = {},
    public cacheDependencies: Record<string, string[]> = {}
  ) {
    this.data = values;
  }
  copy(): IScope {
    const scope = new Scope(
      { ...this.data },
      this.parent,
      this.ntemp,
      this.name,
      this.inst,
      { ...this.operationCache },
      { ...this.cacheDependencies }
    );
    scope.break = this.break;
    scope.continue = this.continue;
    scope.function = this.function;
    return scope;
  }
  createScope(): IScope {
    const scope = this.copy();
    scope.data = {};
    scope.operationCache = {};
    scope.cacheDependencies = {};
    scope.parent = this;
    return scope;
  }
  createFunction(name: string): IScope {
    return new Scope({}, this, 0, name, this.inst);
  }
  has(identifier: string): boolean {
    if (identifier in this.data) return true;
    if (this.parent) return this.parent.has(identifier);
    return false;
  }
  get(identifier: string): INamedValue {
    const value = this.data[identifier];
    if (value) return value as INamedValue;
    if (this.parent) return this.parent.get(identifier);
    throw new CompilerError(`${identifier} is not declared.`);
  }

  set<T extends IValue>(name: string, value: T): T {
    if (name in this.data)
      throw new CompilerError(`${name} is already declared.`);
    return this.hardSet(name, value);
  }

  hardSet<T extends IValue>(name: string, value: T): T {
    if (!name)
      throw new CompilerError("Values in a scope must have an identifier");
    this.data[name] = value;
    return value;
  }
  make(identifier: string, name: string): StoreValue {
    const value = new StoreValue(name);
    return this.set(identifier, value);
  }
  makeTempName(): string {
    let result = `${internalPrefix}t${this.ntemp}`;
    if (this.name) result += `:${this.name}`;

    this.ntemp++;
    return result;
  }

  addCachedOperation(
    op: string,
    result: IValue,
    left: IValue,
    right?: IValue | undefined
  ): void {
    if (!left.name || !result.name || (right && !right.name)) return;

    const id = formatCacheId(op, left, right);

    this.operationCache[id] = result;

    this.clearDependentCache(result);
    addCacheDependency(this, left.name, id);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (right) addCacheDependency(this, right.name!, id);
    addCacheDependency(this, result.name, id);
  }

  getCachedOperation(
    op: string,
    left: IValue,
    right?: IValue | undefined
  ): IValue | undefined {
    const id = formatCacheId(op, left, right);
    const result = this.operationCache[id];
    if (result) return result;
    if (this.parent) return this.parent.getCachedOperation(op, left, right);
  }

  clearDependentCache(value: IValue): void {
    if (!value.name) return;

    const dependents = this.cacheDependencies[value.name];
    if (dependents) {
      for (const id of dependents) {
        delete this.operationCache[id];
      }
    }
    if (this.parent) this.parent.clearDependentCache(value);
  }
}

function formatCacheId(op: string, left: IValue, right?: IValue) {
  if (right) return `{${op}}{${left.name}}{${right.name}}`;
  return `{${op}}{${left.name}}`;
}

function addCacheDependency(scope: IScope, name: string, id: string) {
  (scope.cacheDependencies[name] ??= []).push(id);
}
