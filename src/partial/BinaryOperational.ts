import { TValueConstructor } from ".";
import { IValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";
import * as es from "estree"
import { EOperation } from "../types";



export function BinaryOperational<B extends TValueConstructor>(
	Base: B
): TValueConstructor {
	return class BinaryOperational extends Base {

		

		// math
		add(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Add, scope, this, value);
		}
		subtract(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Subtract, scope, this, value);
		}
		multiply(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Multiply, scope, this, value);
		}
		divide(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Divide, scope, this, value);
		}
		remainder(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Modulus, scope, this, value);
		}
		power(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Pow, scope, this, value);
		}

		// bitwise
		bitwiseAnd(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseAnd, scope, this, value);
		}
		bitwiseOr(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseOr, scope, this, value);
		}
		bitwiseXor(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseXor, scope, this, value);
		}
		bitwiseNot(scope: IScope): TResLines {
			return this.operation(EOperation.BitwiseNot, scope, this);
		}
		bitwiseLeftShift(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseShiftLeft, scope, this, value);
		}
		bitwiseRightShift(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseShiftRight, scope, this, value);
		}
		bitwiseUnsignedRightShift(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseShiftRight, scope, this, value);
		}

		// comparison
		equal(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.Equal, scope, this, value);
		}
		strictEqual(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.StrictEqual, scope, this, value);
		}
		notEqual(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.NotEqual, scope, this, value);
		}
		strictNotEqual(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.NotEqual, scope, this, value);
		}
		greaterThan(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.GreaterThan, scope, this, value);
		}
		greaterThanOrEqual(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.GreaterThanEqual, scope, this, value);
		}
		lessThan(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.LessThan, scope, this, value);
		}
		lessThanOrEqual(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.LessThanEqual, scope, this, value);
		}
	};
}
