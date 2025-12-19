import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { negateValue } from "../flow/helper";
import { SourceRange } from "../SourceRange";
import { es, THandler } from "../types";
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

  cursor.connectBlock(initLoopBlock, SourceRange.fromNode(node));
  if (node.init) {
    c.handle(scope, cursor, node.init);
  }

  cursor.connectBlock(testBlock, SourceRange.fromNode(node));

  const test = node.test
    ? c.handle(scope, cursor, node.test)
    : c.registerValue(new LiteralValue(1));

  const notTest = negateValue(c, cursor, test, SourceRange.fromNode(node));
  cursor.setEndInstruction(
    new BreakIfInstruction(
      notTest,
      afterLoopBlock,
      bodyBlock,
      SourceRange.fromNode(node),
    ),
  );

  cursor.currentBlock = bodyBlock;
  c.handle(scope, cursor, node.body);

  cursor.connectBlock(incrementBlock, SourceRange.fromNode(node));

  if (node.update) {
    c.handle(scope, cursor, node.update);
  }

  cursor.setEndInstruction(
    new BreakInstruction(testBlock.toBackward(), SourceRange.fromNode(node)),
  );

  cursor.currentBlock = afterLoopBlock;

  return c.nullId;
};
