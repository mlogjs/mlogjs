import { THandler } from ".";
import { JumpLine, EJumpKind, AddressLine, TResLines } from "../line";
import { LiteralValue } from "../value";
import * as es from "estree";

export const ForStatement: THandler = (c, scope, node: es.ForStatement) => {
	scope = scope.extend();

	const initLines = node.init ? c.handle(scope, node.init)[1] : [];
	const [test, testLines] = node.test
		? c.handleEvaluate(scope, node.test)
		: [new LiteralValue(scope, 1), []];
	const updateLines = node.update ? c.handle(scope, node.update)[1] : [];
	const startLoopAddr = new LiteralValue(scope, null);
	const endLoopAddr = new LiteralValue(scope, null);

    const startLoopLine = new AddressLine(startLoopAddr).bindContinue(scope)
    const endLoopLine = new AddressLine(endLoopAddr).bindBreak(scope)

	return [
		null,
		[
			...initLines,
			startLoopLine,
			...testLines,
			new JumpLine(endLoopAddr, EJumpKind.NotEqual, test, new LiteralValue(scope, 0)),
			...c.handle(scope, node.body)[1],
			...updateLines,
			new JumpLine(startLoopAddr, EJumpKind.Always),
			endLoopLine,
		],
	];
};
