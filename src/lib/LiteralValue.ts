import { EOperation, IScope, TResLines, IValue } from ".";
import { NumericalValue } from "./NumericalValue";

export type TLiteral = string | number;

const literalOperations = {
	equal: (a: number, b: number) => +(a === b),
	notEqual: (a: number, b: number) => +(a !== b),
	lessThan: (a: number, b: number) => +(a < b),
	greaterThan: (a: number, b: number) => +(a > b),
	lessThanEq: (a: number, b: number) => +(a <= b),
	greaterThanEq: (a: number, b: number) => +(a >= b),
	add: (a: number, b: number) => a + b,
	sub: (a: number, b: number) => (b ? a - b : -a),
	mul: (a: number, b: number) => a * b,
	div: (a: number, b: number) => a / b,
	mod: (a: number, b: number) => a % b,
	pow: (a: number, b: number) => a ** b,
	land: (a: number, b: number) => +(a && b),
	and: (a: number, b: number) => a & b,
	or: (a: number, b: number) => a | b,
	xor: (a: number, b: number) => a ^ b,
	shr: (a: number, b: number) => a >> b,
	shl: (a: number, b: number) => a << b,
	not: (a: number) => +!a,
	flip: (a: number) => ~a,
};

export class LiteralValue extends NumericalValue {
	constant = true;
	data: TLiteral;

	constructor(data: TLiteral) {
		super();
		this.data = data;
	}

	evaluate(scope: IScope): TResLines {
		return [this, []];
	}

	protected compileOperation(
		kind: keyof typeof literalOperations,
		scope: IScope,
		value: LiteralValue
	): TResLines {
		const data = literalOperations[kind](this.data as number, value.data as number);
		return [new LiteralValue(data), []];
	}

	protected runtimeOperation(kind: EOperation, scope: IScope, value: IValue): TResLines {
		if (value instanceof LiteralValue) {
			return this.compileOperation(kind, scope, value);
		}
		return super.runtimeOperation(kind, scope, value);
	}

	serialize() {
		return JSON.stringify(this.data);
	}
}
