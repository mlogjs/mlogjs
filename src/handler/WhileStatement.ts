import { THandler } from ".";
import { JumpLine, EJumpKind, AddressLine, ILine } from "../line";
import { LiteralValue } from "../value";
import * as es from "estree";

export const WhileStatement: THandler = (c, scope, node: es.WhileStatement) => {
	const lines : ILine[] = [];
	const [test, testLines] = c.handleEvaluate(scope, node.test);

	const startLoopAddr = new LiteralValue(scope, null);
	const endLoopAddr = new LiteralValue(scope, null);
	const startLoopLine = new AddressLine(startLoopAddr).bindContinue(scope)
	const endLoopLine = new AddressLine(endLoopAddr).bindBreak(scope)

	if (test instanceof LiteralValue) {
		if (test.data) {
			lines.push(
				startLoopLine,
				...c.handle(scope, node.body)[1],
				new JumpLine(startLoopAddr, EJumpKind.Always),
				endLoopLine
			);
		}
		return [null, lines];
	}
	
	lines.push(
		startLoopLine,
		...testLines,
		new JumpLine(endLoopAddr, EJumpKind.NotEqual, test, new LiteralValue(scope, 0)),
		...c.handle(scope, node.body)[1],
		new JumpLine(startLoopAddr, EJumpKind.Always),
		endLoopLine
	);
	return [null, lines];
};
