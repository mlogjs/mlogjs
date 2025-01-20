import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { negateValue } from "../flow/helper";
import { es, THandler } from "../types";

export const WhileStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.WhileStatement,
) => {
  const testBlock = new Block();
  const bodyBlock = new Block();
  const afterLoopBlock = new Block();
  const continueBlock = new Block(
    new BreakInstruction(testBlock.toBackward(), node),
  );

  const childScope = scope.createScope();
  childScope.break = afterLoopBlock;
  childScope.continue = continueBlock;

  cursor.connectBlock(testBlock, node);

  const test = c.handle(scope, cursor, node.test);

  const notTest = negateValue(c, cursor, test, node);

  cursor.setEndInstruction(
    new BreakIfInstruction(notTest, afterLoopBlock, bodyBlock, node),
  );

  cursor.currentBlock = bodyBlock;
  c.handle(childScope, cursor, node.body);
  cursor.setEndInstruction(new BreakInstruction(continueBlock, node));

  cursor.currentBlock = afterLoopBlock;
  return c.nullId;
};

export const DoWhileStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.DoWhileStatement,
) => {
  const testBlock = new Block();
  const bodyBlock = new Block();
  const afterLoopBlock = new Block();

  const childScope = scope.createScope();
  childScope.break = afterLoopBlock;
  childScope.continue = testBlock;

  cursor.connectBlock(bodyBlock, node);
  c.handle(childScope, cursor, node.body);

  cursor.setEndInstruction(new BreakInstruction(testBlock, node));

  cursor.currentBlock = testBlock;
  const test = c.handle(scope, cursor, node.test);
  const notTest = negateValue(c, cursor, test, node);

  cursor.setEndInstruction(
    new BreakIfInstruction(
      notTest,
      afterLoopBlock,
      bodyBlock.toBackward(),
      node,
    ),
  );

  cursor.currentBlock = afterLoopBlock;
  return c.nullId;
};
