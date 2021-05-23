import { LiteralValue } from "../values";
import { InstructionBase } from "../instructions";
import { IScope, IValue } from "../types";
import { MacroFunction } from "./Function";

export class Print extends MacroFunction {
	constructor(scope: IScope) {
		super(scope, (...values: IValue[]) => {
			return [null, [new InstructionBase("print", ...values)]];
		});
	}
}

export class Concat extends MacroFunction {
	constructor(scope: IScope) {
		super(scope, (...values: IValue[]) => {
			for (const value of values)
				if (!(value instanceof LiteralValue))
					throw new Error("Concat arguments must all be literal values.");
			return [
				new LiteralValue(scope, values.map((v) => (v as LiteralValue).data).join("")),
				[],
			];
		});
	}
}
