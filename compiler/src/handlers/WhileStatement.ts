import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import { es, IInstruction, THandler } from "../types";
import { LiteralValue } from "../values";

export const WhileStatement: THandler<null> = (
  c,
  scope,
  node: es.WhileStatement
) => {
  const lines: IInstruction[] = [];
  const [test, testLines] = c.handleConsume(scope, node.test);

  const startLoopAddr = new LiteralValue(scope, null as never);
  const endLoopAddr = new LiteralValue(scope, null as never);
  const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(scope);
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(scope);

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
    new JumpInstruction(
      endLoopAddr,
      EJumpKind.Equal,
      test,
      new LiteralValue(scope, 0)
    ),
    ...c.handle(scope, node.body)[1],
    new JumpInstruction(startLoopAddr, EJumpKind.Always),
    endLoopLine
  );
  return [null, lines];
};

export const DoWhileStatement: THandler<null> = (
  c,
  scope,
  node: es.DoWhileStatement
) => {
  const lines: IInstruction[] = [];
  const [test, testLines] = c.handleConsume(scope, node.test);

  const startLoopAddr = new LiteralValue(scope, null as never);
  const endLoopAddr = new LiteralValue(scope, null as never);
  const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(scope);
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(scope);

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
    ...c.handle(scope, node.body)[1],
    ...testLines,
    new JumpInstruction(
      startLoopAddr,
      EJumpKind.Equal,
      test,
      new LiteralValue(scope, 1)
    ),
    endLoopLine
  );
  return [null, lines];
};
