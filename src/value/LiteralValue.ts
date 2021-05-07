import { Value } from ".";
import { IScope } from "../core";
import { TResLines } from "../line";
import { CompileOperational, compileOperationalName } from "../partial/CompileOperational";
import { TLiteral } from "../types";
export class LiteralValue extends CompileOperational(Value) {
	data: { [compileOperationalName]: TLiteral };

	constant = true;
	evaluate(scope: IScope): TResLines {
		return [this, []];
	}
	toString() {
		return JSON.stringify(this.data[compileOperationalName]);
	}
	constructor(scope: IScope, value: TLiteral) {
		super(scope);
		this.data["std::literal"] = value;
	}
}
