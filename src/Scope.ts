import { StoreValue } from "./values";
import { AddressResolver } from "./instructions";
import { IScope, TValue } from "./types";

export class Scope implements IScope {
	parent: Scope;
	values: { [k: string]: TValue };
	stacked: boolean = false;
	tempIndex: number = 0;
	breakAddressResolver: AddressResolver;
	continueAddressResolver: AddressResolver;
	constructor(
		values: { [k: string]: TValue },
		parent: Scope = null,
		stacked = false,
		tempIndex = 0
	) {
		this.values = values;
		this.parent = parent;
		this.stacked = stacked;
		this.tempIndex = tempIndex;
	}
	make(name: string, storeName: string): TValue {
		return this.set(name, this.stacked ? null : new StoreValue(this, storeName))
	}
	createScope(): IScope {
		return new Scope({}, this, this.stacked, this.tempIndex);
	}
	createFunction(stacked?: boolean): IScope {
		return new Scope({}, this, stacked ?? this.stacked, this.tempIndex);
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
