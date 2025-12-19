import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { negateValue } from "../flow/helper";
import { SourceRange } from "../SourceRange";
import { THandler, es } from "../types";

export const IfStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.IfStatement,
) => {
  const test = c.handle(scope, cursor, node.test);

  const consequentBlock = new Block();
  const alternateBlock = new Block();
  const exitBlock = new Block();

  // usually results in better ordering of the generated mlog instructions
  const notTest = negateValue(c, cursor, test, SourceRange.fromNode(node));

  cursor.setEndInstruction(
    new BreakIfInstruction(
      notTest,
      alternateBlock,
      consequentBlock,
      SourceRange.fromNode(node),
    ),
  );

  cursor.currentBlock = consequentBlock;
  c.handle(scope, cursor, node.consequent);
  cursor.setEndInstruction(
    new BreakInstruction(exitBlock, SourceRange.fromNode(node)),
  );

  cursor.currentBlock = alternateBlock;
  if (node.alternate) {
    c.handle(scope, cursor, node.alternate);
  }
  // this has to be done regardless because
  // the alternate block has to be connected to the exit block
  cursor.setEndInstruction(
    new BreakInstruction(exitBlock, SourceRange.fromNode(node)),
  );

  cursor.currentBlock = exitBlock;

  return c.nullId;
};
