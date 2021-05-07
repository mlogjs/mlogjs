import { THandler } from ".";
import * as es from "estree";

export const BinaryExpression: THandler = (c, scope, node: es.BinaryExpression) => {
	const [left, leftLines] = c.handleEvaluate(scope, node.left);
	const [right, rightLines] = c.handleEvaluate(scope, node.right);
	const [op, opLines] = left.binaryOperation(node.operator, scope, right);
	return [op, [...leftLines, ...rightLines, ...opLines]];
};

export const LogicalExpression: THandler = (c, scope, node: es.LogicalExpression) => {
	const [left, leftLines] = c.handleEvaluate(scope, node.left);
	const [right, rightLines] = c.handleEvaluate(scope, node.right);
	const [op, opLines] = left.logicalOperation(node.operator, scope, right);
	return [op, [...leftLines, ...rightLines, ...opLines]];
};

export const AssignmentExpression: THandler = (c, scope, node: es.AssignmentExpression) => {
	const [left, leftLines] = c.handleEvaluate(scope, node.left);
	const [right, rightLines] = c.handleEvaluate(scope, node.right);
	const [op, opLines] = left.assignmentOperation(node.operator, scope, right);
	return [op, [...leftLines, ...rightLines, ...opLines]];
};

export const UpdateExpression: THandler = (c, scope, node: es.UpdateExpression) => {
	const [arg, argLines] = c.handleEvaluate(scope, node.argument);
	const [op, opLines] = arg.updateOperation(node.operator, scope);
	return [op, [...argLines, ...opLines]];
};

export const UnaryExpression: THandler = (c, scope, node: es.UnaryExpression) => {
	const [arg, argLines] = c.handleEvaluate(scope, node.argument);
	const [op, opLines] = arg.unaryOperation(node.operator, scope);
	return [op, [...argLines, ...opLines]];
};
