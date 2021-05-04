import Scope from "../Scope";
import { EOperation, TResLines } from "../types";
import Accumulator from "./Accumulator";
import Literal from "./Literal";



export default class Value {

	constant: boolean = false;

	protected accumulatedOperation(kind: EOperation, scope: Scope, value?: Value) {
		const [left, leftLines] = this.evaluate(scope);
		const [right, rightLines] = value ? value.evaluate(scope) : [null, []];
		const acc = new Accumulator(scope);
		return [acc, [...leftLines, ...rightLines, ["op", kind, acc, left, right]]];
	}

	protected assignFromResLines(scope: Scope, [res, lines]: TResLines): TResLines {
		const [assigned, assignedLines] = this.tryAssign(scope, res);
		return [assigned, [...lines, ...assignedLines]];
	}

	serialize(scope: Scope): string {
		throw Error("Cannot serialize");
	}
	evaluate(scope: Scope): TResLines {
		throw Error("Cannot evaluate");
	}
	getMember(scope: Scope, index: Value, value: Value): TResLines {
		throw Error("Cannot get member");
	}
	getComputedMember(scope: Scope, index: Value, value: Value): TResLines {
		throw Error("Cannot get computed member");
	}
	call(scope: Scope, args: Value[]): TResLines {
		throw Error("Cannot call");
	}
	// assignment
	tryAssign(scope: Scope, value: Value): TResLines {
		if (this.constant) throw Error("Cannot assign value to constant.")
		return this.assign(scope, value)
	}
	assign(scope: Scope, value: Value): TResLines {
		throw Error("Cannot assign");
	}
	addAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.add(scope, value));
	}
	subtractAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.subtract(scope, value));
	}
	multiplyAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.multiply(scope, value));
	}
	divideAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.divide(scope, value));
	}
	modulusAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.modulus(scope, value));
	}
	powerAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.power(scope, value));
	}
	leftShiftAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.bitwiseLeftShift(scope, value));
	}
	rightShiftAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.bitwiseRightShift(scope, value));
	}
	unsignedRightShiftAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.BitwiseZeroFillRightShift(scope, value));
	}
	bitwiseANDAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.bitwiseAnd(scope, value));
	}
	bitwiseXORAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.bitwiseXor(scope, value));
	}
	bitwiseORAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.bitwiseOr(scope, value));
	}
	logicalANDAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.logicalAnd(scope, value));
	}
	logicalORAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.logicalOr(scope, value));
	}
	logicalNullishAssign(scope: Scope, value: Value): TResLines {
		return this.assignFromResLines(scope, this.logicalNullish(scope, value));
	}
	// comparison
	equal(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Equal, scope, value);
	}
	strictEqual(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Equal, scope, value);
	}
	notEqual(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.NotEqual, scope, value);
	}
	strictNotEqual(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.NotEqual, scope, value);
	}
	greaterThan(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.GreaterThan, scope, value);
	}
	greaterThanOrEqual(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.GreaterThanEqual, scope, value);
	}
	lessThan(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.LessThan, scope, value);
	}
	lessThanOrEqual(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.LessThanEqual, scope, value);
	}
	// arithmetic
	add(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Add, scope, value);
	}
	subtract(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Subtract, scope, value);
	}
	multiply(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Multiply, scope, value);
	}
	divide(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Divide, scope, value);
	}
	modulus(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Modulus, scope, value);
	}
	increment(scope: Scope): TResLines {
		return this.add(scope, new Literal(1));
	}
	decrement(scope: Scope): TResLines {
		return this.subtract(scope, new Literal(1));
	}
	unaryNegate(scope: Scope): TResLines {
		return this.accumulatedOperation(EOperation.Subtract, scope);
	}
	unaryPlus(scope: Scope): TResLines {
		return [this, []];
	}
	power(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.Pow, scope, value);
	}
	// bitwise
	bitwiseAnd(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseAnd, scope, value);
	}
	bitwiseOr(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseOr, scope, value);
	}
	bitwiseXor(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseXor, scope, value);
	}
	bitwiseNot(scope: Scope): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseNot, scope);
	}
	bitwiseLeftShift(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseShiftLeft, scope, value);
	}
	bitwiseRightShift(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseShiftRight, scope, value);
	}
	BitwiseZeroFillRightShift(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseShiftRight, scope, value);
	}
	// logical
	logicalAnd(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.LogicalAnd, scope, value);
	}
	logicalOr(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseOr, scope, value);
	}
	logicalNot(scope: Scope): TResLines {
		return this.accumulatedOperation(EOperation.LogicalNot, scope);
	}
	logicalNullish(scope: Scope, value: Value): TResLines {
		return this.accumulatedOperation(EOperation.BitwiseOr, scope, value);
	}
}
