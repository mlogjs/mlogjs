import { IScope, TValue, TValueInstructions } from "../types";
import { operators } from "../operators";

export class VoidValue implements TValue {
	scope: IScope;
	constant = true
	constructor(scope: IScope) {
		this.scope = scope;
	}
	eval(scope: IScope): TValueInstructions {
		throw new Error("Cannot eval.");
	}
	call(scope: IScope, args: TValue[]): TValueInstructions {
		throw new Error("Cannot call.");
	}
	get(scope: IScope, name: TValue): TValueInstructions {
		throw new Error("Cannot get.");
	}
	toString(): string {
		throw new Error("Cannot serialize.");
	}
}

for (const key of operators) {
	VoidValue.prototype[key] = () => {
		throw new Error(`Cannot '${key}' operation.`);
	};
}
