import { AddressResolver, JumpInstruction, EJumpKind} from "../instructions";
import { es, THandler } from "../types";
import { LiteralValue } from "../values";


export const ForStatement: THandler = (c, scope, node: es.ForStatement) => {
	scope = scope.createScope();

	const initInst = node.init ? c.handle(scope, node.init)[1] : [];
	const [test, testLines] = node.test
		? c.handleEvaluate(scope, node.test)
		: [new LiteralValue(scope, 1), []];
	const updateLines = node.update ? c.handle(scope, node.update)[1] : [];
	const startLoopAddr = new LiteralValue(scope, null);
	const endLoopAddr = new LiteralValue(scope, null);

    const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(scope)
    const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(scope)

	return [
		null,
		[
			...initInst,
			startLoopLine,
			...testLines,
			new JumpInstruction(endLoopAddr, EJumpKind.NotEqual, test, new LiteralValue(scope, 0)),
			...c.handle(scope, node.body)[1],
			...updateLines,
			new JumpInstruction(startLoopAddr, EJumpKind.Always),
			endLoopLine,
		],
	];
};
