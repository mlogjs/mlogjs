import { AddressResolver, JumpInstruction, EJumpKind } from "../instructions";
import { es, THandler } from "../types";
import { discardedName, usesAddressResolver, withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";
import { JumpOutValue } from "../values/JumpOutValue";

export const ForStatement: THandler<null> = (
  c,
  parentScope,
  node: es.ForStatement,
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

  if (test instanceof LiteralValue && !test.data) {
    return [null, [...initInst]];
  }
  const isInfiniteLoop = test instanceof LiteralValue;

  const [, bodyLines] = withAlwaysRuns(c.handle(scope, node.body), false);
  return [
    null,
    [
      ...initInst,
      startLoopLine,
      ...testLines,
      ...(isInfiniteLoop ? [] : JumpInstruction.or(test, testOut)),
      ...bodyLines,
      beforeEndLine,
      ...updateLines,
      new JumpInstruction(startLoopAddr, EJumpKind.Always),
      ...(isInfiniteLoop && !usesAddressResolver(endLoopLine, bodyLines)
        ? []
        : [endLoopLine]),
    ],
  ];
};
