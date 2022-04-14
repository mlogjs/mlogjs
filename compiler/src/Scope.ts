import { StoreValue } from "./values";
import { AddressResolver } from "./instructions";
import {
  IFunctionValue,
  IScope,
  IValue,
  IValueOwner,
} from "./types";
import { CompilerError } from "./CompilerError";
import { internalPrefix } from "./utils";
import { ValueOwner } from "./values/ValueOwner";

export class Scope implements IScope {
  data: Record<string, IValueOwner | null>;
  break!: AddressResolver;
  continue!: AddressResolver;
  function!: IFunctionValue;
  constructor(
    values: Record<string, IValueOwner | null>,
    public parent: IScope | null = null,
    public stacked = false,
    public ntemp = 0,
    public name = "",
    public functions: IFunctionValue[] = []
  ) {
    this.data = values;
  }
  copy(): IScope {
    const scope = new Scope(
      { ...this.data },
      this.parent,
      this.stacked,
      this.ntemp,
      this.name,
      this.functions
    );
    scope.break = this.break;
    scope.continue = this.continue;
    scope.function = this.function;
    return scope;
  }
  createScope(): IScope {
    const scope = this.copy();
    scope.data = {};
    scope.parent = this;
    return scope;
  }
  createFunction(name: string, stacked?: boolean): IScope {
    return new Scope(
      {},
      this,
      stacked ?? this.stacked,
      0,
      name,
      this.functions
    );
  }
  isRecursion(fn: IFunctionValue) {
    if (fn === this.function) return true;
    return this.parent?.isRecursion(fn) ?? false;
  }
  has(name: string): boolean {
    if (name in this.data) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }
  get(name: string): IValue {
    const owner = this.data[name];
    if (owner) return owner.value;
    if (this.parent) return this.parent.get(name);
    throw new CompilerError(`${name} is not declared.`);
  }

  set<T extends IValue>(
    ...args: [name: string, value: T] | [owner: IValueOwner<T>]
  ): T {
    const name = args.length === 1 ? args[0].identifier : args[0];
    if (!name)
      throw new CompilerError("Values in a scope must have an identifier");
    if (name in this.data)
      throw new CompilerError(`${name} is already declared.`);
    return this.hardSet(...args);
  }

  hardSet<T extends IValue>(
    ...args: [name: string, value: T] | [owner: IValueOwner<T>]
  ): T {
    const owner =
      args.length === 1
        ? args[0]
        : new ValueOwner({
            scope: this,
            identifier: args[0],
            name: args[0],
            value: args[1],
          });
    const { identifier } = owner;
    if (!identifier)
      throw new CompilerError("Values in a scope must have an identifier");
    this.data[identifier] = owner;
    return owner.value;
  }
  make(identifier: string, name: string): StoreValue {
    const owner = new ValueOwner({
      scope: this,
      value: new StoreValue(this),
      identifier,
      name,
    });
    return this.set(owner);
  }
  makeTempName(): string {
    const result = this.formatName(`${internalPrefix}t${this.ntemp}`);

    this.ntemp++;
    return result;
  }

  formatName(name: string): string {
    if (this.name) return `${name}:${this.name}`;
    const depth = nameDepth(this, name);
    if (depth) return `${name}$${depth}`;
    return name;
  }
}

/**
 * Gets the name depth of a variable, it indicates how many variables
 * with the same name exist on the parent unnamed scopes
 */
function nameDepth(scope: IScope, name: string): number {
  let depth = 0;
  let current: IScope | null = scope.parent;
  while (current != null && !current.name) {
    if (name in current.data) depth++;
    current = current.parent;
  }
  return depth;
}
