import { IValue, StackValue, StoreValue, IScope, TValueMap } from ".";

export class Scope implements IScope {
	accIndex: number;
	valueMap: TValueMap;
	superMap: TValueMap;
	stacked: boolean;
	name: string;

	constructor(values: TValueMap, superValues: TValueMap, stacked: boolean, name: string) {
		this.accIndex = 0;
		this.valueMap = values;
		this.superMap = superValues;
		this.stacked = stacked;
		this.name = name;
	}

	static createRoot(superValues: TValueMap) {
		return new this({}, superValues, false, "");
	}

	extend(name: string, stacked: boolean): IScope {
		return new Scope({}, this.valueMap, stacked, this.name + "_" + name);
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
	createValue(name: string) {
		if (this.stacked) return this.set(name, new StackValue());
		return this.set(name, new StoreValue(this, name));
	}

	get(name: string) {
		if (!this.nameExists(name)) throw Error(`${name} does not exist.`);
		return this.valueMap[name] ?? this.superMap[name];
	}
}
