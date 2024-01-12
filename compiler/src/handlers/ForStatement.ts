import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { es, THandler } from "../types";
import { nullId } from "../utils";
import { LiteralValue } from "../values";

export const ForStatement: THandler = (
  c,
  parentScope,
  context,
  node: es.ForStatement,
) => {
  const initLoopBlock = new Block([]);
  const afterLoopBlock = new Block([]);
  const testBlock = new Block([]);
  const bodyBlock = new Block([]);
  const incrementBlock = new Block([]);

  const scope = parentScope.createScope();
  scope.break = afterLoopBlock;
  scope.continue = incrementBlock;

  context.connectBlock(initLoopBlock, node);
  if (node.init) {
    c.handle(scope, context, node.init);
  }

  context.connectBlock(testBlock, node);

  const test = node.test
    ? c.handle(scope, context, node.test)
    : c.registerValue(new LiteralValue(1));

  context.setEndInstruction(
    new BreakIfInstruction(test, bodyBlock, afterLoopBlock, node),
  );

  context.currentBlock = bodyBlock;
  c.handle(scope, context, node.body);

  context.connectBlock(incrementBlock, node);

  if (node.update) {
    c.handle(scope, context, node.update);
  }

  context.setEndInstruction(new BreakInstruction(testBlock.toBackward(), node));

  context.currentBlock = afterLoopBlock;

  return nullId;
};
