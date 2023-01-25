import { AddressResolver, JumpInstruction, EJumpKind } from "../instructions";
import { es, THandler } from "../types";
import { discardedName, withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";
import { JumpOutValue } from "../values/JumpOutValue";

export const ForStatement: THandler<null> = (
  c,
  parentScope,
  node: es.ForStatement
) => {
  const startLoopAddr = new LiteralValue(null);
  // continue statements jump here to run the loop update lines
  const beforeEndAddr = new LiteralValue(null);
  const endLoopAddr = new LiteralValue(null);

  const scope = parentScope.createScope();
  const testOut = new JumpOutValue(node, endLoopAddr, false);

  const initInst = node.init ? c.handle(scope, node.init)[1] : [];
  const [test, testLines] = node.test
    ? c.handleEval(scope, node.test, testOut)
    : [new LiteralValue(1), []];
  const updateLines = node.update
    ? c.handle(scope, node.update, undefined, discardedName)[1]
    : [];

  const startLoopLine = new AddressResolver(startLoopAddr);
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(scope);
  const beforeEndLine = new AddressResolver(beforeEndAddr).bindContinue(scope);

  if (parentScope.label) {
    beforeEndLine.bindContinue(parentScope);
  }

  return [
    null,
    [
      ...initInst,
      startLoopLine,
      ...testLines,
      ...JumpInstruction.or(
        testOut,
        test,
        EJumpKind.Equal,
        new LiteralValue(0)
      ),
      ...withAlwaysRuns(c.handle(scope, node.body), false)[1],
      beforeEndLine,
      ...updateLines,
      new JumpInstruction(startLoopAddr, EJumpKind.Always),
      endLoopLine,
    ],
  ];
};
