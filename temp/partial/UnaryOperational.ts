import { TValueConstructor } from ".";
import { LiteralValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";
import { EOperation } from "../types";

export function UnaryOperational<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class UnaryOperational extends Base {
		unaryNegate(scope: IScope): TResLines {
            return this.operation(EOperation.Subtract, scope, new LiteralValue(scope, 0), this);
        }
        unaryPlus(scope: IScope): TResLines {
            return [this, []];
        }
	};
}
