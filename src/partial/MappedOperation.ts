import { TValueConstructor } from ".";
import * as es from "estree"
import { IValue } from "../value";
import { IScope } from "../core";
import { TResLines } from "../line";

export const BinaryOperatorMap : {[key in es.BinaryOperator]: keyof IValue} = {
    "!=": "notEqual",
    "!==": "strictNotEqual",
    "%": "remainder",
    "&": "bitwiseAnd",
    "*": "multiply",
    "**": "power",
    "+": "add",
    "-": "subtract",
    "/": "divide",
    "<": "lessThan",
    "<<": "bitwiseLeftShift",
    "<=": "lessThanOrEqual",
    "==": "equal",
    "===": "strictEqual",
    ">": "greaterThan",
    ">=": "greaterThanOrEqual",
    ">>": "bitwiseRightShift",
    ">>>": "bitwiseUnsignedRightShift",
    "^": "bitwiseOr",
    "in": "inOperation",
    "instanceof": "instanceofOperation",
    "|": "bitwiseOr"
}

export const LogicalOperatorMap : {[key in es.LogicalOperator]: keyof IValue} = {
    "&&": "logicalAnd",
    "??": "logicalNullish",
    "||": "logicalOr"
}

export const AssignmentOperatorMap : {[key in es.AssignmentOperator]: keyof IValue} = {
    "=": "tryAssign",
    "%=": "remainderAssign",
    "&=": "bitwiseAndAssign",
    "*=": "multiplyAssign",
    "**=": "powerAssign",
    "+=": "addAssign",
    "-=": "subtractAssign",
    "/=": "divideAssign",
    "<<=": "bitwiseLeftShiftAssign",
    ">>=": "bitwiseRightShiftAssign",
    ">>>=": "bitwiseUnsignedRightShiftAssign",
    "^=": "bitwiseOrAssign",
    "|=": "bitwiseOrAssign"
}

export const UpdateOperatorMap: {[key in es.UpdateOperator]: keyof IValue} = {
    "++": "increment",
    "--": "decrement"
}

export const UnaryOperatorMap: {[key in es.UnaryOperator]: keyof IValue} = {
    "!": "logicalNot",
    "+": "unaryPlus",
    "-": "unaryNegate",
    "delete": "deleteOperation",
    "typeof": "typeofOperation",
    "void": "voidOperation",
    "~": "bitwiseNot"
}

export function MappedOperation<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class MappedOperation extends Base {
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
	};
}
