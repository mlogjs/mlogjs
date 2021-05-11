import { StoreValue } from "./values";
import { AddressResolver } from "./instructions";
import { IInstruction, IScope, IValue } from "./types";

export class Scope implements IScope {
	parent: IScope;
	name: string;
	values: { [k: string]: IValue };
	stacked: boolean = false;
	tempIndex: number = 0;
	extraInstructions: IInstruction[];
	breakAddressResolver: AddressResolver;
	continueAddressResolver: AddressResolver;
	fnRet: IValue;
	fnTemp: IValue;
	constructor(
		values: { [k: string]: IValue },
		parent: IScope = null,
		stacked = false,
		tempIndex = 0,
		name = "",
		inst = []
	) {
		this.values = values;
		this.parent = parent;
		this.stacked = stacked;
		this.tempIndex = tempIndex;
		this.name = name;
		this.extraInstructions = inst;
	}
	make(name: string, storeName: string): IValue {
		return this.set(name, this.stacked ? null : new StoreValue(this, storeName));
	}
	createScope(): IScope {
		const scope = new Scope(
			{},
			this,
			this.stacked,
			this.tempIndex,
			this.name,
			this.extraInstructions
		);
		scope.breakAddressResolver = this.breakAddressResolver;
		scope.continueAddressResolver = this.continueAddressResolver;
		scope.fnRet = this.fnRet
		scope.fnTemp = this.fnTemp
		return scope;
	}
	createFunction(name: string, stacked?: boolean): IScope {
		return new Scope({}, this, stacked ?? this.stacked, 0, name, this.extraInstructions);
	}
	has(name: string): boolean {
		if (name in this.values) return true;
		if (this.parent) return this.parent.has(name);
		return false;
	}
	get(name: string): IValue {
		const value = this.values[name];
		if (value) return value;
		if (this.parent) return this.parent.get(name);
		throw Error(`${name} is not declared.`);
	}
	set(name: string, value: IValue): IValue {
		if (name in this.values) throw Error(`${name} is already declared.`);
		this.values[name] = value;
		return value;
	}
}
