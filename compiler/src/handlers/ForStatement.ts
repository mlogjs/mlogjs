import { AddressResolver, JumpInstruction, EJumpKind } from "../instructions";
import { es, THandler } from "../types";
import { withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";

export const ForStatement: THandler<null> = (
  c,
  parentScope,
  node: es.ForStatement
) => {
  const scope = parentScope.createScope();

  const initInst = node.init ? c.handle(scope, node.init)[1] : [];
  const [test, testLines] = node.test
    ? c.handleConsume(scope, node.test)
    : [new LiteralValue(1), []];
  const updateLines = node.update ? c.handle(scope, node.update)[1] : [];
  const startLoopAddr = new LiteralValue(null as never);
  const endLoopAddr = new LiteralValue(null as never);

  const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(scope);
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(scope);

  if (parentScope.label) {
    startLoopLine.bindContinue(parentScope);
  }

  return [
    null,
    [
      ...initInst,
      startLoopLine,
      ...testLines,
      new JumpInstruction(
        endLoopAddr,
        EJumpKind.Equal,
        test,
        new LiteralValue(0)
      ),
      ...withAlwaysRuns(c.handle(scope, node.body), false)[1],
      ...updateLines,
      new JumpInstruction(startLoopAddr, EJumpKind.Always),
      endLoopLine,
    ],
  ];
};
