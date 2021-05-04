import Literal from "./value/Literal";
import Register from "./value/Register";
import Stacked from "./value/Stacked";
import Value from "./value/Value";

type TValueMap = { [key: string]: Value };

export default class Scope {
	accIndex: number;
	valueMap: TValueMap;
	superMap: TValueMap
	stacked: boolean
	name: string

	constructor(values: TValueMap, superValues: TValueMap, stacked: boolean, name: string) {
		this.accIndex = 0;
		this.valueMap = values;
		this.superMap = superValues
		this.stacked = stacked
		this.name = name
	}

	static createRoot(superValues: TValueMap) {
		return new this({}, superValues, false, "")
	}

	extend(name: string, stacked: boolean): Scope {
		return new Scope({}, this.valueMap, stacked, this.name + "_" + name);
	}

	nameExistsInCurrent(name: string) {
		return name in this.valueMap
	}
	nameExistsInSuper(name: string) {
		return name in this.superMap
	}
	nameExists(name: string) {
		return this.nameExistsInCurrent(name) || this.nameExistsInSuper(name)
	}

	set(name: string, value: Value) {
		if (this.nameExistsInCurrent(name)) throw Error(`${name} has already been declared.`)
		this.valueMap[name] = value
		return value
	}
	createVariable(name: string) {
		if (this.stacked) return this.set(name, new Stacked())
		this.set(name, new Register(this, name))
	}

	get(name: string) {
		if (!this.nameExists(name)) throw Error(`${name} does not exist.`)
		return this.valueMap[name] ?? this.superMap[name]
	}

}
