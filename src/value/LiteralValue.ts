import { EOperation, NumericalValue, IValue } from ".";
import { IScope } from "../core";
import { TResLines } from "../line";

export type TLiteral = string|number

function toNumber(data: TLiteral): number {
	if (typeof data === "number") return data;
	if (typeof data === "string") return 1;
	return 0;
}

function op(handler: (a: number, b: number) => any): (a: any, b?: any) => number {
	return (a, b) => +handler(toNumber(a), toNumber(b));
}

const literalOperations: { [key in EOperation]: (a: any, b?: any) => number } = {
	strictEqual: (a, b) => +(a === b),
	equal: op((a, b) => a == b),
	notEqual: op((a, b) => a != b),
	lessThan: op((a, b) => a < b),
	lessThanEq: op((a, b) => a <= b),
	greaterThan: op((a, b) => a > b),
	greaterThanEq: op((a, b) => a >= b),
	add: op((a, b) => a + b),
	sub: op((a, b) => a - b),
	mul: op((a, b) => a * b),
	div: op((a, b) => a / b),
	mod: op((a, b) => a % b),
	pow: op((a, b) => a ** b),
	and: op((a, b) => a & b),
	land: op((a, b) => a && b),
	or: op((a, b) => a | b),
	xor: op((a, b) => a ^ b),
	shl: op((a, b) => a << b),
	shr: op((a, b) => a >> b),
	not: op((a) => !a),
	flip: op((a) => ~a),
};

export class LiteralValue extends NumericalValue {
	constant = true;
	data: number | string;

	constructor(scope: IScope, data: TLiteral) {
		super(scope);
		this.data = data;
	}

	protected compileOperation(
		kind: keyof typeof literalOperations,
		scope: IScope,
		left: LiteralValue,
		right?: LiteralValue
	): TResLines {
		const data = literalOperations[kind](left.data, right?.data);
		return [new LiteralValue(scope, isFinite(data) ? data : null), []];
	}

	protected runtimeOperation(
		kind: EOperation,
		scope: IScope,
		left: IValue,
		right?: IValue
	): TResLines {
		if (left instanceof LiteralValue && !right) {
			return this.compileOperation(kind, scope, left);
		} else if (left instanceof LiteralValue && right instanceof LiteralValue) {
			return this.compileOperation(kind, scope, left, right);
		}
		return super.runtimeOperation(kind, scope, left, right);
	}

	evaluate(scope: IScope): TResLines {
		return [this, []];
	}

	serialize() {
		return JSON.stringify(this.data);
	}
}
