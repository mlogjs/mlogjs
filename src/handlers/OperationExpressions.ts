import { AssignementOperator, BinaryOperator, LogicalOperator, Operator } from "../operators";
import { THandler, es } from "../types";

export const LRExpression: THandler = (
	c,
	scope,
	node: {
		left: es.Node;
		right: es.Node;
		operator: AssignementOperator | BinaryOperator | LogicalOperator;
	}
) => {
	const [left, leftInst] = c.handleEvaluate(scope, node.left);
	const [right, rightInst] = c.handleEvaluate(scope, node.right);
	const [op, opInst] = left[node.operator](scope, right);
	return [op, [...leftInst, ...rightInst, ...opInst]];
};

export const BinaryExpression: THandler = LRExpression;
export const LogicalExpression: THandler = LRExpression;
export const AssignmentExpression: THandler = LRExpression;

export const UnaryExpression: THandler = (c, scope, { argument, operator }: es.UnaryExpression) => {
	const [arg, argInst] = c.handleEvaluate(scope, argument);
	const [op, opInst] = arg[operator.length === 1 ? "+" : "" + operator](scope);
	return [op, [...argInst, ...opInst]];
};
export const UpdateExpression: THandler = (
	c,
	scope,
	{ argument, operator, prefix }: es.UpdateExpression
) => {
	const [arg, argInst] = c.handleEvaluate(scope, argument);
	const [op, opInst] = arg[operator](scope, prefix);
	return [op, [...argInst, ...opInst]];
};
