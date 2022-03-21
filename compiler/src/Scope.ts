import { StoreValue } from "./values";
import { AddressResolver } from "./instructions";
import { IFunctionValue, IInstruction, IScope, IValue } from "./types";
import { CompilerError } from "./CompilerError";
import { internalPrefix } from "./utils";

export class Scope implements IScope {
  data: Record<string, IValue | null>;
  break!: AddressResolver;
  continue!: AddressResolver;
  function!: IFunctionValue;
  constructor(
    values: Record<string, IValue | null>,
    public parent: IScope | null = null,
    public stacked = false,
    public ntemp = 0,
    public name = "",
    public inst: IInstruction[] = []
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
      this.inst
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
    return new Scope({}, this, stacked ?? this.stacked, 0, name, this.inst);
  }
  has(name: string): boolean {
    if (name in this.data) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }
  get(name: string): IValue {
    const value = this.data[name];
    if (value) return value;
    if (this.parent) return this.parent.get(name);
    throw new CompilerError(`${name} is not declared.`);
  }
  set<T extends IValue>(name: string, value: T): T {
    if (name in this.data)
      throw new CompilerError(`${name} is already declared.`);
    value.onScopeSet?.(this, name);
    return this.hardSet(name, value);
  }
  hardSet<T extends IValue>(name: string, value: T): T {
    this.data[name] = value;
    return value;
  }
  make(name: string, storeName: string): StoreValue {
    return this.set(
      name,
      this.stacked ? (null as never) : new StoreValue(this, storeName)
    );
  }
  makeTempName(): string {
    const name = this.name ? `:${this.name}` : "";
    const result = `${internalPrefix}t${this.ntemp}${name}`;

    this.ntemp++;
    return result;
  }
}
