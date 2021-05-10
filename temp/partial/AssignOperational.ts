import { TValueConstructor } from ".";
import { IValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";

export function AssignOperational<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class AssignOperational extends Base {
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
    };
}
