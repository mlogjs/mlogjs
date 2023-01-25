import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import { es, THandler } from "../types";
import { usesAddressResolver, withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";
import { JumpOutValue } from "../values/JumpOutValue";

export const WhileStatement: THandler<null> = (
  c,
  scope,
  node: es.WhileStatement
) => {
  const startLoopAddr = new LiteralValue(null);
  const endLoopAddr = new LiteralValue(null);
  const testOut = new JumpOutValue(node, endLoopAddr, false);

  const [test, testLines] = c.handleEval(scope, node.test, testOut);

  const childScope = scope.createScope();
  const startLoopLine = new AddressResolver(startLoopAddr).bindContinue(
    childScope
  );
  const endLoopLine = new AddressResolver(endLoopAddr).bindBreak(childScope);

  if (scope.label) {
    startLoopLine.bindContinue(scope);
  }

  if (test instanceof LiteralValue) {
    if (!test.data) return [null, []];

    const bodyInst = c.handle(childScope, node.body)[1];
    return [
      null,
      [
        startLoopLine,
        ...bodyInst,
        new JumpInstruction(startLoopAddr, EJumpKind.Always),
        ...(usesAddressResolver(endLoopLine, bodyInst) ? [endLoopLine] : []),
      ],
    ];
  }

  return [
    null,
    [
      startLoopLine,
      ...testLines,
      ...JumpInstruction.or(
        testOut,
        test,
        EJumpKind.Equal,
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
  const startLoopAddr = new LiteralValue(null);
  const endLoopAddr = new LiteralValue(null);
  const testOut = new JumpOutValue(node, startLoopAddr, true);

  const [test, testLines] = c.handleEval(scope, node.test, testOut);

  const childScope = scope.createScope();
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
        ...(usesAddressResolver(endLoopLine, bodyLines) ? [endLoopLine] : []),
      ],
    ];
  }

  return [
    null,
    [
      startLoopLine,
      ...bodyLines,
      ...testLines,
      ...JumpInstruction.or(
        testOut,
        test,
        EJumpKind.Equal,
        new LiteralValue(1)
      ),
      ...(usesAddressResolver(endLoopLine, bodyLines) ? [endLoopLine] : []),
    ],
  ];
};
