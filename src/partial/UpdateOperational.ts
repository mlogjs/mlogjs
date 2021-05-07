import { TValueConstructor } from ".";
import { LiteralValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";

export function UpdateOperational<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class UpdateOperational extends Base {
		increment(scope: IScope): TResLines {
			return this.assignFromResLines(scope, this.add(scope, new LiteralValue(scope, 1)));
		}
		decrement(scope: IScope): TResLines {
			return this.assignFromResLines(scope, this.subtract(scope, new LiteralValue(scope, 1)));
		}
	};
}
