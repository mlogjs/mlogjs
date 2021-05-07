import { ValueBase } from ".";
import { IScope } from "../core";
import {
	AssignOperational,
	BinaryOperational,
	LogicalOperational,
	MappedOperation,
	Operational,
	operationalName,
	UnaryOperational,
} from "../partial";

export class Value extends AssignOperational(
	UnaryOperational(LogicalOperational(BinaryOperational(Operational(MappedOperation(ValueBase)))))
) {
	constructor(scope: IScope) {
		super(scope);
		this.data[operationalName] = null;
	}
}
