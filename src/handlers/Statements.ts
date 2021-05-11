import { EJumpKind, JumpInstruction, SetCounterInstruction } from "../instructions";
import { THandler, es } from "../types";
import { LiteralValue, StoreValue } from "../values";

export const ExpressionStatement: THandler = (c, scope, node: es.ExpressionStatement) => {
	return c.handle(scope, node.expression);
};

export const BlockStatement: THandler = (c, scope, node: es.BlockStatement) => {
	return c.handleMany(scope.createScope(), node.body);
};

export const BreakStatement: THandler = (_, scope) => {
	const addr = new LiteralValue(scope, null);
	scope.breakAddressResolver.bind(addr);
	return [null, [new JumpInstruction(addr, EJumpKind.Always)]];
};

export const ContinueStatement: THandler = (_, scope) => {
	const addr = new LiteralValue(scope, null);
	scope.continueAddressResolver.bind(addr);
	return [null, [new JumpInstruction(addr, EJumpKind.Always)]];
};

export const ReturnStatement: THandler = (c, scope, node: es.ReturnStatement) => {
	if (!node.argument) return [null, [new SetCounterInstruction(scope.fnRet)]];
	const [arg, inst] = c.handleEval(scope, node.argument);
	return [
		null,
		[...inst, ...scope.fnTemp["="](scope, arg)[1], new SetCounterInstruction(scope.fnRet)],
	];
};
