import Scope from "../Scope";
import { EOperation } from "../types";
import Value from "./Value";

export type TLiteral = string | number

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
}

export default class Literal extends Value {
	constant = true;
	data: TLiteral;
	
	constructor(data: TLiteral) {
		super()
		this.data = data;
	}

	protected literalOperation(kind : keyof typeof literalOperations, scope: Scope, value: Literal) {
		
		const data = literalOperations[kind](this.data as number, value.data as number)
		return [new Literal(data), []]
	}

	protected accumulatedOperation(kind: EOperation, scope: Scope, value: Value) {
		if (value instanceof Literal) {
			return this.literalOperation(kind, scope, value)
		}
		return super.accumulatedOperation(kind, scope, value)
	}

	serialize() {
		return JSON.stringify(this.data)
	}
	
	
}
