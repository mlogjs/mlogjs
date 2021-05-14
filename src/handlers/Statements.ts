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
	scope.break.bind(addr);
	return [null, [new JumpInstruction(addr, EJumpKind.Always)]];
};

export const ContinueStatement: THandler = (_, scope) => {
	const addr = new LiteralValue(scope, null);
	scope.continue.bind(addr);
	return [null, [new JumpInstruction(addr, EJumpKind.Always)]];
};

export const ReturnStatement: THandler = (c, scope, node: es.ReturnStatement) => {
	const [arg, argInst] = node.argument ? c.handle(scope, node.argument) : [null, []];
	const [ret, retInst] = scope.function.return(scope, arg);
	return [ret, [...argInst, ...retInst]];
};
