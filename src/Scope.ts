import { StoreValue } from "./values";
import { AddressResolver } from "./instructions";
import { IScope, TValue } from "./types";

export class Scope implements IScope {
	parent: Scope;
	name: string
	values: { [k: string]: TValue };
	stacked: boolean = false;
	tempIndex: number = 0;
	breakAddressResolver: AddressResolver;
	continueAddressResolver: AddressResolver;
	constructor(
		values: { [k: string]: TValue },
		parent: Scope = null,
		stacked = false,
		tempIndex = 0,
		name=""
	) {
		this.values = values;
		this.parent = parent;
		this.stacked = stacked;
		this.tempIndex = tempIndex;
		this.name = name
	}
	make(name: string, storeName: string): TValue {
		return this.set(name, this.stacked ? null : new StoreValue(this, storeName))
	}
	createScope(): IScope {
		return new Scope({}, this, this.stacked, this.tempIndex, this.name);
	}
	createFunction(name: string, stacked?: boolean): IScope {
		return new Scope({}, this, stacked ?? this.stacked, 0, name);
	}
	has(name: string): boolean {
		if (name in this.values) return true;
		if (this.parent) return this.parent.has(name);
		return false;
	}
	get(name: string): TValue {
		const value = this.values[name];
		if (value) return value;
		if (this.parent) return this.parent.get(name);
		throw Error(`${name} is not declared.`);
	}
	set(name: string, value: TValue): TValue {
		if (name in this.values) throw Error(`${name} is already declared.`);
		this.values[name] = value;
		return value;
	}
}
