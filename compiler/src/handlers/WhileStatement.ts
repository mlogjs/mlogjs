import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { negateValue } from "../flow/helper";
import { SourceRange } from "../SourceRange";
import { es, THandler } from "../types";

export const WhileStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.WhileStatement,
) => {
  const loc = SourceRange.fromNode(node);
  const testBlock = new Block();
  const bodyBlock = new Block();
  const afterLoopBlock = new Block();
  const continueBlock = new Block(
    new BreakInstruction(testBlock.toBackward(), loc),
  );

  const childScope = scope.createScope();
  childScope.break = afterLoopBlock;
  childScope.continue = continueBlock;

  cursor.connectBlock(testBlock, loc);

  const test = c.handle(scope, cursor, node.test);

  const notTest = negateValue(c, cursor, test, loc);

  cursor.setEndInstruction(
    new BreakIfInstruction(notTest, afterLoopBlock, bodyBlock, loc),
  );

  cursor.currentBlock = bodyBlock;
  c.handle(childScope, cursor, node.body);
  cursor.setEndInstruction(new BreakInstruction(continueBlock, loc));

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
  const loc = SourceRange.fromNode(node);

  const childScope = scope.createScope();
  childScope.break = afterLoopBlock;
  childScope.continue = testBlock;

  cursor.connectBlock(bodyBlock, loc);
  c.handle(childScope, cursor, node.body);

  cursor.setEndInstruction(new BreakInstruction(testBlock, loc));

  cursor.currentBlock = testBlock;
  const test = c.handle(scope, cursor, node.test);
  const notTest = negateValue(c, cursor, test, loc);

  cursor.setEndInstruction(
    new BreakIfInstruction(
      notTest,
      afterLoopBlock,
      bodyBlock.toBackward(),
      loc,
    ),
  );

  cursor.currentBlock = afterLoopBlock;
  return c.nullId;
};
