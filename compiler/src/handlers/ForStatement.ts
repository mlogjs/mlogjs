import {
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
  ImmutableId,
} from "../flow";
import { es, THandler } from "../types";
import { nullId } from "../utils";
import { LiteralValue } from "../values";

export const ForStatement: THandler = (
  c,
  parentScope,
  cursor,
  node: es.ForStatement,
) => {
  const initLoopBlock = new Block();
  const afterLoopBlock = new Block();
  const testBlock = new Block();
  const bodyBlock = new Block();
  const incrementBlock = new Block();

  const scope = parentScope.createScope();
  scope.break = afterLoopBlock;
  scope.continue = incrementBlock;

  cursor.connectBlock(initLoopBlock, node);
  if (node.init) {
    c.handle(scope, cursor, node.init);
  }

  cursor.connectBlock(testBlock, node);

  const test = node.test
    ? c.handle(scope, cursor, node.test)
    : c.registerValue(new LiteralValue(1));

  const invertedTest = new ImmutableId();
  const zero = c.registerValue(new LiteralValue(0));

  cursor.addInstruction(
    new BinaryOperationInstruction("equal", test, zero, invertedTest, node),
  );
  cursor.setEndInstruction(
    new BreakIfInstruction(invertedTest, afterLoopBlock, bodyBlock, node),
  );
  // cursor.setEndInstruction(
  //   new BreakIfInstruction(test, bodyBlock, afterLoopBlock, node),
  // );

  cursor.currentBlock = bodyBlock;
  c.handle(scope, cursor, node.body);

  cursor.connectBlock(incrementBlock, node);

  if (node.update) {
    c.handle(scope, cursor, node.update);
  }

  cursor.setEndInstruction(new BreakInstruction(testBlock.toBackward(), node));

  cursor.currentBlock = afterLoopBlock;

  return nullId;
};
