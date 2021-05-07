import { TValueConstructor } from ".";
import { IScope } from "../core";
import { OperationLine, TResLines } from "../line";
import { EOperation } from "../types";
import { IValue, TemporaryValue } from "../value";

export const operationalName = "std::operational"
export function Operational<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class Operational extends Base {
		operation(kind: EOperation, scope: IScope, left: IValue, right?: IValue): TResLines {
			console.log(right)
			if (right && !right.is(operationalName))
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

}
