import { IValue, TemporaryValue } from "../value";
import { IScope } from "../core";
import { OperationLine, TResLines } from "../line";
import { EOperation } from "../types";
import {
	TValueConstructor,
	BinaryOperational,
	LogicalOperational,
	UnaryOperational,
	UpdateOperational,
	AssignOperational,
	MappedOperation,
} from ".";


export function Operational<B extends TValueConstructor>(Base: B): TValueConstructor {
	let c: TValueConstructor = class Operational extends MappedOperation(Base) {
		operation(kind: EOperation, scope: IScope, left: IValue, right?: IValue): TResLines {
			if (right && !(right instanceof Operational))
				throw Error("Cannot do numerical operation on non-numerical value.");
			const [leftValue, leftLines] = left.evaluate(scope);
			const [rightValue, rightLines] = right ? right.evaluate(scope) : [null, []];
			const acc = new TemporaryValue(scope);
			return [
				acc,
				[...leftLines, ...rightLines, new OperationLine(kind, acc, leftValue, rightValue)],
			];
		}
	};
	c = BinaryOperational(c);
	c = LogicalOperational(c);
	c = UnaryOperational(c);
	c = UpdateOperational(c);
	c = AssignOperational(c);
	return c;
}


