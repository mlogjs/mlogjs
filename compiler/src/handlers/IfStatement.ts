import { Block, BreakIfInstruction, BreakInstruction } from "../flow";
import { THandler, es } from "../types";
import { nullId } from "../utils";

export const IfStatement: THandler = (
  c,
  scope,
  context,
  node: es.IfStatement,
) => {
  const test = c.handle(scope, context, node.test);

  const consequentBlock = new Block([]);
  const alternateBlock = new Block([]);
  const exitBlock = new Block([]);

  context.setEndInstruction(
    new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
  );

  context.currentBlock = consequentBlock;
  c.handle(scope, context, node.consequent);
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = alternateBlock;
  if (node.alternate) {
    c.handle(scope, context, node.alternate);
  }
  // this has to be done regardless because
  // the alternate block has to be connected to the exit block
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = exitBlock;

  return nullId;
};
