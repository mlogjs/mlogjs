import { TValueConstructor } from ".";
import { IValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";
import { EOperation } from "../types";

export function LogicalOperational<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class LogicalOperational extends Base {
		logicalAnd(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.LogicalAnd, scope, this, value);
		}
		logicalOr(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseOr, scope, this, value);
		}
		logicalNot(scope: IScope): TResLines {
			return this.operation(EOperation.LogicalNot, scope, this);
		}
		logicalNullish(scope: IScope, value: IValue): TResLines {
			return this.operation(EOperation.BitwiseOr, scope, this, value);
		}
	};
}
