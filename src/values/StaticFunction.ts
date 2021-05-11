import { IScope, TValue, TValueInstructions } from "../types";
import { LiteralValue } from "./LiteralValue";
import { VoidValue } from "./VoidValue";

export class StaticFunction extends VoidValue implements TValue {
	address: LiteralValue;
	constructor(scope: IScope) {
		super(scope);
		this.address = new LiteralValue(scope, null)
	}
	call(scope: IScope, args: TValue[]): TValueInstructions {
		return
	}
}
