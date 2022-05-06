import { SenseableValue } from "./values";
import { AddressResolver } from "./instructions";
import {
  IFunctionValue,
  IInstruction,
  IOwnedValue,
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
  get(identifier: string): IOwnedValue {
    const owner = this.data[identifier];
    if (owner) return owner.value as IOwnedValue;
    if (this.parent) return this.parent.get(identifier);
    throw new CompilerError(`${identifier} is not declared.`);
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
  make(identifier: string, name: string): SenseableValue {
    const value = new SenseableValue(this);
    value.constant = false;

    const owner = new ValueOwner({
      scope: this,
      value,
      identifier,
      name,
    });
    return this.set(owner);
  }
  makeTempName(): string {
    let result = `${internalPrefix}t${this.ntemp}`;
    if (this.name) result += `:${this.name}`;

    this.ntemp++;
    return result;
  }
}
