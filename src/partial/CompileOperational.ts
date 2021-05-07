import { Operational, TValueConstructor } from ".";
import { IValue, LiteralValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";
import { EOperation, TLiteral } from "../types";

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

export const compileOperationalName = "std::compileOperational"
export function CompileOperational<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class CompileOperational extends Base {
		data: {[compileOperationalName]: TLiteral}
		
		protected compileOperation(
			kind: keyof typeof literalOperations,
			scope: IScope,
			left: IValue,
			right?: IValue
		): TResLines {
			const data = literalOperations[kind](left.data[compileOperationalName], right?.data[compileOperationalName]);
			return [new LiteralValue(scope, isFinite(data) ? data : null), []];
		}
		operation(kind: EOperation, scope: IScope, left: IValue, right?: IValue): TResLines {
			if (left.is(compileOperationalName) && !right) {
				return this.compileOperation(kind, scope, left);
			} else if (left.is(compileOperationalName) && right.is(compileOperationalName)) {
				return this.compileOperation(kind, scope, left, right);
			}
			return super.operation(kind, scope, left, right);
		}
	};
}
