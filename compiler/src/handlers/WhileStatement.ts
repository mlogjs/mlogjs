import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import { es, THandler } from "../types";
import { withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";

export const WhileStatement: THandler<null> = (
  c,
  scope,
  node: es.WhileStatement
) => {
  const [test, testLines] = c.handleEval(scope, node.test);

  const childScope = scope.createScope();
  const startLoopAddr = new LiteralValue(null);
  const endLoopAddr = new LiteralValue(null);
  const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(
    childScope
  );
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(childScope);

  if (scope.label) {
    startLoopLine.bindContinue(scope);
  }

  if (test instanceof LiteralValue) {
    if (test.data) {
      return [
        null,
        [
          startLoopLine,
          ...c.handle(childScope, node.body)[1],
          new JumpInstruction(startLoopAddr, EJumpKind.Always),
          endLoopLine,
        ],
      ];
    }
    return [null, []];
  }

  return [
    null,
    [
      startLoopLine,
      ...testLines,
      new JumpInstruction(
        endLoopAddr,
        EJumpKind.Equal,
        test,
        new LiteralValue(0)
      ),
      ...withAlwaysRuns(c.handle(childScope, node.body), false)[1],
      new JumpInstruction(startLoopAddr, EJumpKind.Always),
      endLoopLine,
    ],
  ];
};

export const DoWhileStatement: THandler<null> = (
  c,
  scope,
  node: es.DoWhileStatement
) => {
  const [test, testLines] = c.handleEval(scope, node.test);

  const childScope = scope.createScope();
  const startLoopAddr = new LiteralValue(null);
  const endLoopAddr = new LiteralValue(null);
  const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(
    childScope
  );
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(childScope);

  if (scope.label) {
    startLoopLine.bindContinue(scope);
  }

  const [, bodyLines] = c.handle(childScope, node.body);

  if (test instanceof LiteralValue) {
    if (!test.data) return [null, bodyLines];
    return [
      null,
      [
        startLoopLine,
        ...bodyLines,
        new JumpInstruction(startLoopAddr, EJumpKind.Always),
        endLoopLine,
      ],
    ];
  }

  return [
    null,
    [
      startLoopLine,
      ...bodyLines,
      ...testLines,
      new JumpInstruction(
        startLoopAddr,
        EJumpKind.Equal,
        test,
        new LiteralValue(1)
      ),
      endLoopLine,
    ],
  ];
};
