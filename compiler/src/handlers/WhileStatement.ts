import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { es, THandler } from "../types";
import { nullId } from "../utils";

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
  cursor.setEndInstruction(
    new BreakIfInstruction(test, bodyBlock, afterLoopBlock, node),
  );

  cursor.currentBlock = bodyBlock;
  c.handle(childScope, cursor, node.body);
  cursor.setEndInstruction(new BreakInstruction(continueBlock, node));

  cursor.currentBlock = afterLoopBlock;
  return nullId;
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

  cursor.setEndInstruction(
    new BreakIfInstruction(test, bodyBlock.toBackward(), afterLoopBlock, node),
  );

  cursor.currentBlock = afterLoopBlock;
  return nullId;
};
