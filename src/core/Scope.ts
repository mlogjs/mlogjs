import { AddressLine, ILine } from "../line";
import { IValue, StoreValue } from "../value";

export type TValueMap = { [key: string]: IValue };

export interface IScope {
	accIndex: number;
	valueMap: TValueMap;
	superMap: TValueMap;
	stacked: boolean;
	breakAddressLine: AddressLine
	continueAddressLine: AddressLine
	extend(stacked?: boolean): IScope;
	nameExistsInCurrent(name: string): boolean;
	nameExistsInSuper(name: string): boolean;
	nameExists(name: string): boolean;
	set(name: string, value: IValue): IValue;
	createValue(name: string, storeName?: string): IValue;
	get(name: string): IValue;
}

export class Scope implements IScope {
	accIndex: number;
	valueMap: TValueMap;
	superMap: TValueMap;
	stacked: boolean;
	breakAddressLine: AddressLine;
	continueAddressLine: AddressLine;

	constructor(values: TValueMap, superValues: TValueMap, stacked: boolean) {
		this.accIndex = 0;
		this.valueMap = values;
		this.superMap = superValues;
		this.stacked = stacked;
	}
	

	static createRoot(superValues: TValueMap) {
		return new this({}, superValues, false);
	}

	extend(stacked?: boolean): IScope {
		const scope = new Scope({}, { ...this.valueMap, ...this.superMap }, stacked ?? this.stacked);
		scope.breakAddressLine = this.breakAddressLine
		scope.continueAddressLine = this.continueAddressLine
		return scope
	}

	nameExistsInCurrent(name: string) {
		return name in this.valueMap;
	}
	nameExistsInSuper(name: string) {
		return name in this.superMap;
	}
	nameExists(name: string) {
		return this.nameExistsInCurrent(name) || this.nameExistsInSuper(name);
	}

	set(name: string, value: IValue) {
		if (this.nameExistsInCurrent(name)) throw Error(`${name} has already been declared.`);
		this.valueMap[name] = value;
		return value;
	}

	createValue(name: string, storeName?: string) {
		if (this.stacked) return //this.set(name, new StackValue(this));
		return this.set(name, new StoreValue(this, storeName ?? name));
	}

	get(name: string) {
		if (!this.nameExists(name)) throw Error(`${name} does not exist.`);
		return this.valueMap[name] ?? this.superMap[name];
	}
}
