import { ValueBase, IValue, TemporaryValue, LiteralValue, EOperation } from ".";
import { IScope } from "../core";
import { OperationLine, TResLines } from "../line";

export class NumericalValue extends ValueBase {
	protected runtimeOperation(
		kind: EOperation,
		scope: IScope,
		left: IValue,
		right?: IValue
	): TResLines {
		if (right && !(right instanceof NumericalValue))
			throw Error("Cannot do numerical operation on non-numerical value.");
		const [leftValue, leftLines] = left.evaluate(scope);
		const [rightValue, rightLines] = right ? right.evaluate(scope) : [null, []];
		const acc = new TemporaryValue(scope);
		return [acc, [...leftLines, ...rightLines, new OperationLine(kind, acc, leftValue, rightValue)]];
	}

	addAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.add(scope, value));
	}
	subtractAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.subtract(scope, value));
	}
	multiplyAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.multiply(scope, value));
	}
	divideAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.divide(scope, value));
	}
	remainderAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.remainder(scope, value));
	}
	powerAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.power(scope, value));
	}
	bitwiseLeftShiftAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.bitwiseLeftShift(scope, value));
	}
	bitwiseRightShiftAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.bitwiseRightShift(scope, value));
	}
	bitwiseUnsignedRightShiftAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.bitwiseUnsignedRightShift(scope, value));
	}
	bitwiseAndAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.bitwiseAnd(scope, value));
	}
	bitwiseXorAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.bitwiseXor(scope, value));
	}
	bitwiseOrAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.bitwiseOr(scope, value));
	}
	logicalAndAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.logicalAnd(scope, value));
	}
	logicalOrAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.logicalOr(scope, value));
	}
	logicalNullishAssign(scope: IScope, value: IValue): TResLines {
		return this.assignFromResLines(scope, this.logicalNullish(scope, value));
	}
	increment(scope: IScope): TResLines {
		return this.assignFromResLines(scope, this.add(scope, new LiteralValue(scope, 1)));
	}
	decrement(scope: IScope): TResLines {
		return this.assignFromResLines(scope, this.subtract(scope, new LiteralValue(scope, 1)));
	}
	// comparison
	equal(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Equal, scope, this, value);
	}
	strictEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.StrictEqual, scope, this, value);
	}
	notEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.NotEqual, scope, this, value);
	}
	strictNotEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.NotEqual, scope, this, value);
	}
	greaterThan(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.GreaterThan, scope, this, value);
	}
	greaterThanOrEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.GreaterThanEqual, scope, this, value);
	}
	lessThan(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.LessThan, scope, this, value);
	}
	lessThanOrEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.LessThanEqual, scope, this, value);
	}
	// arithmetic
	add(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Add, scope, this, value);
	}
	subtract(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Subtract, scope, this, value);
	}
	multiply(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Multiply, scope, this, value);
	}
	divide(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Divide, scope, this, value);
	}
	remainder(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Modulus, scope, this, value);
	}
	unaryNegate(scope: IScope): TResLines {
		return this.runtimeOperation(EOperation.Subtract, scope, new LiteralValue(scope, 0), this);
	}
	unaryPlus(scope: IScope): TResLines {
		return [this, []];
	}
	power(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Pow, scope, this, value);
	}
	// bitwise
	bitwiseAnd(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseAnd, scope, this, value);
	}
	bitwiseOr(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseOr, scope, this, value);
	}
	bitwiseXor(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseXor, scope, this, value);
	}
	bitwiseNot(scope: IScope): TResLines {
		return this.runtimeOperation(EOperation.BitwiseNot, scope, this);
	}
	bitwiseLeftShift(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseShiftLeft, scope, this, value);
	}
	bitwiseRightShift(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseShiftRight, scope, this, value);
	}
	bitwiseUnsignedRightShift(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseShiftRight, scope, this, value);
	}
	// logical
	logicalAnd(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.LogicalAnd, scope, this, value);
	}
	logicalOr(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseOr, scope, this, value);
	}
	logicalNot(scope: IScope): TResLines {
		return this.runtimeOperation(EOperation.LogicalNot, scope, this);
	}
	logicalNullish(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseOr, scope, this, value);
	}
}
