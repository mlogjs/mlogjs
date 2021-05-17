import { SetInstruction } from "../instructions";
import { operators } from "../operators";
import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { StoreValue } from "./";
import { LiteralValue } from "./LiteralValue";

export class TempValue extends StoreValue {
	proxied: IValue;
	canProxy = true;
	setInst: IInstruction

	constructor(scope: IScope, name?: string) {
		super(scope, name ?? "t" + scope.ntemp + (scope.name ? ":" + scope.name : ""));
		if (!name) scope.ntemp++;
	}

	eval(scope: IScope): TValueInstructions {
		return super.eval(scope);
	}

	
	"="(scope: IScope, value: IValue): TValueInstructions {
		if (this.proxied) {
			this.noProxy();
			return [this, [new SetInstruction(this, value)]]
		}
		if (value instanceof LiteralValue && this.canProxy) {
			return this.proxy(value);
		}
		return super["="](scope, value);
	}

	proxy(value: IValue): TValueInstructions {
		if (!this.canProxy) {
			console.log(this.proxied)
			throw new Error("Cannot proxy (canProxy = false).")
		}
		if (this.proxied) throw new Error("Cannot proxy multiple times.");
		this.proxied = value;
		this.canProxy = false
		console.log(`${this} is becoming a proxy for ${value}`)
		for (const key of [...operators, "eval", "get", "call", "toString", "proxy"] as const) {
			if (key !== "=" && key in value) this[key] = (...args: any) => value[key].apply(value, args);
		}
		this.setInst = new SetInstruction(this, value)
		this.setInst.hidden = true
		return [this, [this.setInst]];
	}

	noProxy(){
		this.setInst.hidden = false
		for (const key of [...operators, "eval", "get", "call", "toString", "proxy"] as const) {
			this[key] = TempValue.prototype[key]
		}
	}
}
