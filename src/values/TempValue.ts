import { SetInstruction } from "../instructions";
import { operators } from "../operators";
import { IScope, IValue, TValueInstructions } from "../types";
import { StoreValue } from "./";

export class TempValue extends StoreValue {
	auto: boolean
	proxied: IValue
	constructor(scope: IScope, name?: string) {
		super(scope, name ?? "t" + scope.ntemp + (scope.name ? ":" + scope.name : ""));
		this.auto = !name
		if (this.auto) scope.ntemp++;
	}

	eval(scope: IScope): TValueInstructions {
		if (this.auto) this.scope.ntemp--;
		return super.eval(scope);
	}

	proxy(value: IValue) {
		if (this.proxied) throw new Error("Cannot proxy multiple times.")
		this.proxied = value
		if (this.auto) this.scope.ntemp--;
		for (const key of [...operators, "eval", "get", "call", "toString", "proxy"]) {
			if (key in value) this[key] = (...args: any) => value[key].apply(value, args)
		}
	}
}
