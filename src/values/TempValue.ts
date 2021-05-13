import { SetInstruction } from "../instructions";
import { IScope, IValue, TValueInstructions } from "../types";
import { StoreValue } from "./";

export class TempValue extends StoreValue {
	setInstruction: SetInstruction;

	constructor(scope: IScope) {
		super(scope, "t" + scope.ntemp + (scope.name ? ":" + scope.name : ""));
		scope.ntemp++;
	}
	eval(scope: IScope): TValueInstructions {
		scope.ntemp--;
		if (this.setInstruction) this.setInstruction.hidden = false;
		return super.eval(scope);
	}
	"="(scope: IScope, value: IValue): TValueInstructions {
		const [evalValue, evalInst] = value.eval(scope);
		this.setInstruction = new SetInstruction(this, evalValue);
		this.setInstruction.hidden = true;
		return [this, [...evalInst, this.setInstruction]];
	}
	toStore(name: string) {
		if (this.setInstruction) this.setInstruction.hidden = false;
		this.name = name;
		this.eval = super.eval;
		this["="] = super["="];
	}
}
