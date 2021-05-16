import { SetInstruction } from "../instructions";
import { operators } from "../operators";
import { IScope, IValue, TValueInstructions } from "../types";
import { StoreValue } from "./";
import { LiteralValue } from "./LiteralValue";

export class TempValue extends StoreValue {
	proxied: IValue
	constructor(scope: IScope, name?: string) {
		super(scope, name ?? "t" + scope.ntemp + (scope.name ? ":" + scope.name : ""));
		if (!name) scope.ntemp++;
	}

	eval(scope: IScope): TValueInstructions {
		return super.eval(scope);
	}

	"="(scope: IScope, value: IValue): TValueInstructions{
		if (value instanceof LiteralValue) return this.proxy(value)
		return super["="](scope, value)
	}

	proxy(value: IValue): TValueInstructions {
		console.log(this.toString(), "is becoming a proxy for", value.toString())
		if (this.proxied) throw new Error("Cannot proxy multiple times.")
		this.proxied = value
		for (const key of [...operators, "eval", "get", "call", "toString", "proxy"]) {
			if (key in value) this[key] = (...args: any) => value[key].apply(value, args)
		}
		return [this, []];
	}
}
