import { operators } from "../operators";
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

	typeof(scope: IScope): TValueInstructions {
		return [new LiteralValue(scope, "object"), []]
	}

	get(scope: IScope, key: LiteralValue): TValueInstructions {
		const member = this.data[key.data];
		if (member) return [member, []];
		const { $get } = this.data;
		if (!$get) throw new Error("Cannot get undefined member.");
		return $get.call(scope, [key]);
	}

	eval(scope: IScope): TValueInstructions {
		const { $eval } = this.data;
		if (!$eval) return [this, []];
		return $eval.call(scope, []);
	}

	call(scope: IScope, args: IValue[]): TValueInstructions {
		const { $call } = this.data;
		if (!$call) return super.call(scope, args);
		return $call.call(scope, args);
	}
}

for (const op of operators) {
	ObjectValue.prototype[op] = function (this: ObjectValue, ...args: any[]) {
		const $ = this.data["$" + op];
		if (!$) return VoidValue.prototype[op].apply(this, args)
		// @ts-ignore
		return $.call(...args)
	};
}
