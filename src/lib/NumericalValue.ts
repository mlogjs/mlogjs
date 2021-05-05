import { EOperation, IValue, LiteralValue, IScope, TemporaryValue, TResLines, ValueBase } from ".";

export class NumericalValue extends ValueBase {
	protected runtimeOperation(kind: EOperation, scope: IScope, value?: IValue): TResLines {
		const [left, leftLines] = this.evaluate(scope);
		const [right, rightLines] = value ? value.evaluate(scope) : [null, []];
		const acc = new TemporaryValue(scope);
		return [acc, [...leftLines, ...rightLines, ["op", kind, acc, left, right]]];
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
	// comparison
	equal(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Equal, scope, value);
	}
	strictEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Equal, scope, value);
	}
	notEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.NotEqual, scope, value);
	}
	strictNotEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.NotEqual, scope, value);
	}
	greaterThan(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.GreaterThan, scope, value);
	}
	greaterThanOrEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.GreaterThanEqual, scope, value);
	}
	lessThan(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.LessThan, scope, value);
	}
	lessThanOrEqual(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.LessThanEqual, scope, value);
	}
	// arithmetic
	add(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Add, scope, value);
	}
	subtract(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Subtract, scope, value);
	}
	multiply(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Multiply, scope, value);
	}
	divide(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Divide, scope, value);
	}
	remainder(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Modulus, scope, value);
	}
	increment(scope: IScope): TResLines {
		return this.add(scope, new LiteralValue(1));
	}
	decrement(scope: IScope): TResLines {
		return this.subtract(scope, new LiteralValue(1));
	}
	unaryNegate(scope: IScope): TResLines {
		return this.runtimeOperation(EOperation.Subtract, scope);
	}
	unaryPlus(scope: IScope): TResLines {
		return [this, []];
	}
	power(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.Pow, scope, value);
	}
	// bitwise
	bitwiseAnd(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseAnd, scope, value);
	}
	bitwiseOr(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseOr, scope, value);
	}
	bitwiseXor(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseXor, scope, value);
	}
	bitwiseNot(scope: IScope): TResLines {
		return this.runtimeOperation(EOperation.BitwiseNot, scope);
	}
	bitwiseLeftShift(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseShiftLeft, scope, value);
	}
	bitwiseRightShift(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseShiftRight, scope, value);
	}
	bitwiseUnsignedRightShift(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseShiftRight, scope, value);
	}
	// logical
	logicalAnd(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.LogicalAnd, scope, value);
	}
	logicalOr(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseOr, scope, value);
	}
	logicalNot(scope: IScope): TResLines {
		return this.runtimeOperation(EOperation.LogicalNot, scope);
	}
	logicalNullish(scope: IScope, value: IValue): TResLines {
		return this.runtimeOperation(EOperation.BitwiseOr, scope, value);
	}
}
