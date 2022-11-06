import { SenseableValue } from "./values";
import { AddressResolver } from "./instructions";
import {
  EMutability,
  IFunctionValue,
  IInstruction,
  INamedValue,
  IScope,
  IValue,
} from "./types";
import { CompilerError } from "./CompilerError";
import { assign, internalPrefix } from "./utils";

export class Scope implements IScope {
  data: Record<string, IValue | null>;
  break!: AddressResolver;
  continue!: AddressResolver;
  function!: IFunctionValue;
  label?: string;
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
  createFunction(name: string, stacked = this.stacked): IScope {
    return new Scope({}, this, stacked, 0, name, this.inst);
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
  make(identifier: string, name: string): SenseableValue {
    const value = assign(new SenseableValue(name), {
      mutability: EMutability.mutable,
    });
    return this.set(identifier, value);
  }
  makeTempName(): string {
    let result = `${internalPrefix}t${this.ntemp}`;
    if (this.name) result += `:${this.name}`;

    this.ntemp++;
    return result;
  }
}
