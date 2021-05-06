import * as es from "estree";
import { IScope } from "../core";
import {
	IValue,
	BinaryOperatorMap,
	LogicalOperatorMap,
	AssignmentOperatorMap,
	UpdateOperatorMap,
	UnaryOperatorMap,
} from ".";
import { TResLines } from "../line";
import { PrintLine } from "../line/PrintLine";

export abstract class ValueBase implements IValue {
	constant: boolean = false;
	scope: IScope;
	constructor(scope: IScope) {
		this.scope = scope;
	}
	print(): TResLines {
		return [this, [new PrintLine(this)]];
	}
	binaryOperation(operator: es.BinaryOperator, scope: IScope, value: IValue): TResLines {
		const handler = this[BinaryOperatorMap[operator]] as (
			scope: IScope,
			value: IValue
		) => TResLines;
		return handler.bind(this)(scope, value);
	}
	logicalOperation(operator: es.LogicalOperator, scope: IScope, value: IValue): TResLines {
		const handler = this[LogicalOperatorMap[operator]] as (
			scope: IScope,
			value: IValue
		) => TResLines;
		return handler.bind(this)(scope, value);
	}
	assignmentOperation(operator: es.AssignmentOperator, scope: IScope, value: IValue): TResLines {
		const handler = this[AssignmentOperatorMap[operator]] as (
			scope: IScope,
			value: IValue
		) => TResLines;
		return handler.bind(this)(scope, value);
	}
	updateOperation(operator: es.UpdateOperator, scope: IScope): TResLines {
		const handler = this[UpdateOperatorMap[operator]] as (scope: IScope) => TResLines;
		return handler.bind(this)(scope);
	}
	unaryOperation(operator: es.UnaryOperator, scope: IScope): TResLines {
		const handler = this[UnaryOperatorMap[operator]] as (scope: IScope) => TResLines;
		return handler.bind(this)(scope);
	}

	toString() {
		return this.serialize();
	}

	serialize(): string {
		throw Error("Cannot serialize");
	}
	evaluate(scope: IScope): TResLines {
		throw Error("Cannot evaluate");
	}
	getMember(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot get member");
	}
	getComputedMember(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot get computed member");
	}
	call(scope: IScope, args: IValue[]): TResLines {
		throw Error("Cannot call");
	}
	// assignment
	tryAssign(scope: IScope, value: IValue): TResLines {
		if (this.constant) throw Error("Cannot assign value to constant.");
		return this.assign(scope, value);
	}
	assign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot assign");
	}

	assignFromResLines(scope: IScope, [res, lines]: TResLines): TResLines {
		const [assigned, assignedLines] = this.tryAssign(scope, res);
		return [assigned, [...lines, ...assignedLines]];
	}

	addAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	subtractAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	multiplyAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	divideAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	remainderAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	powerAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseLeftShiftAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseRightShiftAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseUnsignedRightShiftAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseAndAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseXorAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseOrAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	logicalAndAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	logicalOrAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	logicalNullishAssign(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	// comparison
	equal(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	strictEqual(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	notEqual(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	strictNotEqual(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	greaterThan(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	greaterThanOrEqual(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	lessThan(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	lessThanOrEqual(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	// arithmetic
	add(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	subtract(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	multiply(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	divide(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	remainder(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	increment(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	decrement(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	unaryNegate(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	unaryPlus(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	power(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	// bitwise
	bitwiseAnd(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseOr(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseXor(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseNot(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	bitwiseLeftShift(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseRightShift(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	bitwiseUnsignedRightShift(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	// logical
	logicalAnd(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	logicalOr(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	logicalNot(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	logicalNullish(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	// misc
	inOperation(scope: IScope, value: IValue): TResLines {
		throw Error("Cannot ");
	}
	instanceofOperation(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	voidOperation(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	typeofOperation(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
	deleteOperation(scope: IScope): TResLines {
		throw Error("Cannot ");
	}
}
