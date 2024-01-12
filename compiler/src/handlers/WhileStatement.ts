import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { es, THandler } from "../types";
import { nullId } from "../utils";

export const WhileStatement: THandler = (
  c,
  scope,
  context,
  node: es.WhileStatement,
) => {
  const testBlock = new Block([]);
  const bodyBlock = new Block([]);
  const afterLoopBlock = new Block([]);
  const continueBlock = new Block(
    [],
    new BreakInstruction(testBlock.toBackward(), node),
  );

  const childScope = scope.createScope();
  childScope.break = afterLoopBlock;
  childScope.continue = continueBlock;

  context.connectBlock(testBlock, node);

  const test = c.handle(scope, context, node.test);
  context.setEndInstruction(
    new BreakIfInstruction(test, bodyBlock, afterLoopBlock, node),
  );

  context.currentBlock = bodyBlock;
  c.handle(childScope, context, node.body);
  context.setEndInstruction(new BreakInstruction(continueBlock, node));

  context.currentBlock = afterLoopBlock;
  return nullId;
};

export const DoWhileStatement: THandler = (
  c,
  scope,
  context,
  node: es.DoWhileStatement,
) => {
  const testBlock = new Block([]);
  const bodyBlock = new Block([]);
  const afterLoopBlock = new Block([]);

  const childScope = scope.createScope();
  childScope.break = afterLoopBlock;
  childScope.continue = testBlock;

  context.connectBlock(bodyBlock, node);
  c.handle(childScope, context, node.body);

  context.setEndInstruction(new BreakInstruction(testBlock));

  context.currentBlock = testBlock;
  const test = c.handle(scope, context, node.test);

  context.setEndInstruction(
    new BreakIfInstruction(test, bodyBlock.toBackward(), afterLoopBlock),
  );

  context.currentBlock = afterLoopBlock;
  return nullId;
};
