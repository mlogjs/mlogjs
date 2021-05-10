import { THandler } from ".";
import * as es from "estree";
import { EJumpKind, JumpLine } from "../line";
import { LiteralValue } from "../value";

export const ExpressionStatement: THandler = (c, scope, node: es.ExpressionStatement) => {
	return c.handle(scope, node.expression);
};

export const BlockStatement: THandler = (c, scope, node: es.BlockStatement) => {
	return c.handleMany(scope.extend(), node.body);
};

export const BreakStatement: THandler = (_, scope) => {
	const addr = new LiteralValue(scope, null);
	scope.breakAddressLine.addressBind(addr);
	return [null, [new JumpLine(addr, EJumpKind.Always)]];
};

export const ContinueStatement: THandler = (_, scope) => {
	const addr = new LiteralValue(scope, null);
	scope.continueAddressLine.addressBind(addr);
	return [null, [new JumpLine(addr, EJumpKind.Always)]];
};
