import { IScope, IValue, IValueOwner } from "../types";

export interface IValueOwnerParams<T extends IValue> {
  scope: IScope;
  constant?: boolean;
  value: T;
  /** The identifier of the variable that `this` represents */
  identifier?: string;
  /** The name that the variable will have during transpilation to mlog */
  name?: string;
}

export class ValueOwner<T extends IValue = IValue> implements IValueOwner<T> {
  scope: IScope;
  constant: boolean;
  value: T;
  owned: Set<T>;
  /** The identifier of the variable that `this` represents */
  identifier?: string;
  /** The name that the variable will have during transpilation to mlog */
  name: string;
  temporary: boolean;
  /**
   * Creates a new `ValueOwner`, if `value` is already owned,
   * `this` will be aliased to `value`, else `this` will own `value`
   */
  constructor({
    scope,
    constant = false,
    value,
    identifier,
    name,
  }: IValueOwnerParams<T>) {
    this.scope = scope;
    this.constant = constant;
    this.value = value;
    this.identifier = identifier;
    this.name = name ?? scope.makeTempName();
    this.temporary = !name;
    this.owned = new Set();
    if (!value.owner) this.own(value);
  }

  own(target: T): void {
    target.owner = this;
    this.owned.add(target);
  }

  replace(target: T): void {
    this.value.owner = null;
    target.owner = this;
    this.value = target;
  }

  moveInto(owner: IValueOwner<T>): void {
    this.owned.forEach(value => owner.own(value));
  }
}
