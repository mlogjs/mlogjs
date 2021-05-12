import { IScope, IValue, TValueInstructions } from "../types";
import { LiteralValue } from "./LiteralValue";
import { VoidValue } from "./VoidValue";


export class ObjectValue extends VoidValue {
	constant = true;
	macro = true;
	data: { [k: string]: IValue };

	constructor(scope: IScope, data: { [k: string]: IValue } = {}) {
		super(scope);
		this.data = data;
	}

	get(scope: IScope, key: LiteralValue): TValueInstructions {
		const member = this.data[key.data]
		if (member) return [member,[]]
		throw new Error("Cannot get undefined member.")
	}

	eval(scope: IScope): TValueInstructions {
		return [this, []];
	}
}
