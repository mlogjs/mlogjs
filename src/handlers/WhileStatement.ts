
import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import { es, IInstruction, THandler } from "../types";
import { LiteralValue } from "../values";


export const WhileStatement: THandler = (c, scope, node: es.WhileStatement) => {
	const lines : IInstruction[] = [];
	const [test, testLines] = c.handleEval(scope, node.test);

	const startLoopAddr = new LiteralValue(scope, null);
	const endLoopAddr = new LiteralValue(scope, null);
	const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(scope)
	const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(scope)

	if (test instanceof LiteralValue) {
		if (test.data) {
			lines.push(
				startLoopLine,
				...c.handle(scope, node.body)[1],
				new JumpInstruction(startLoopAddr, EJumpKind.Always),
				endLoopLine
			);
		}
		return [null, lines];
	}
	
	lines.push(
		startLoopLine,
		...testLines,
		new JumpInstruction(endLoopAddr, EJumpKind.NotEqual, test, new LiteralValue(scope, 0)),
		...c.handle(scope, node.body)[1],
		new JumpInstruction(startLoopAddr, EJumpKind.Always),
		endLoopLine
	);
	return [null, lines];
};
