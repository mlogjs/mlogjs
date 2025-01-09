import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { negateValue } from "../flow/helper";
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

  const notTest = negateValue(c, cursor, test, node);
  cursor.setEndInstruction(
    new BreakIfInstruction(notTest, afterLoopBlock, bodyBlock, node),
  );

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
