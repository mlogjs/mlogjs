import * as es from "estree";
import { IValue } from ".";
import { IScope } from "../core";
import { TResLines } from "../line";
import { EOperation } from "../types";

export class ValueBase implements IValue {
	constant: boolean = false;
	scope: IScope;
	data: { [key: string]: any } = {};

	assignFromResLines(scope: IScope, [res, lines]: TResLines): TResLines {
		const [assigned, assignedLines] = this.tryAssign(scope, res);
		return [assigned, [...lines, ...assignedLines]];
	}

	tryAssign(scope: IScope, value: IValue): TResLines {
		if (this.constant) throw Error("Cannot assign value to constant.");
		return this.assign(scope, value);
	}

	constructor(scope: IScope) {
		this.scope = scope;
	}
	
	is(kind: string): boolean {
		return kind in this.data
	}

	operation(kind: EOperation, scope: IScope, left: IValue, right?: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	binaryOperation(operator: es.BinaryOperator, scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalOperation(operator: es.LogicalOperator, scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	assignmentOperation(operator: es.AssignmentOperator, scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	updateOperation(operator: es.UpdateOperator, scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	unaryOperation(operator: es.UnaryOperator, scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	evaluate(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	getMember(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	getComputedMember(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	call(scope: IScope, args: IValue[]): TResLines {
		throw new Error("Method not implemented.");
	}
	newCall(scope: IScope, args: IValue[]): TResLines {
		throw new Error("Method not implemented.");
	}
	assign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	addAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	subtractAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	multiplyAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	divideAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	remainderAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	powerAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseLeftShiftAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseRightShiftAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseUnsignedRightShiftAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseAndAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseXorAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseOrAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalAndAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalOrAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalNullishAssign(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	equal(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	strictEqual(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	notEqual(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	strictNotEqual(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	greaterThan(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	greaterThanOrEqual(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	lessThan(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	lessThanOrEqual(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	add(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	subtract(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	multiply(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	divide(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	remainder(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	power(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseAnd(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseOr(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseXor(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseLeftShift(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseRightShift(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseUnsignedRightShift(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalAnd(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalOr(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalNullish(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	inOperation(scope: IScope, value: IValue): TResLines {
		throw new Error("Method not implemented.");
	}
	instanceofOperation(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	bitwiseNot(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	logicalNot(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	voidOperation(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	typeofOperation(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	deleteOperation(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	unaryNegate(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	unaryPlus(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	increment(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	decrement(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
}
