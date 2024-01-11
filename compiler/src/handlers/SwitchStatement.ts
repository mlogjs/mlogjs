import {
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
} from "../flow";
import { es, THandler } from "../types";
import { nullId } from "../utils";

export const SwitchStatement: THandler = (
  c,
  scope,
  context,
  node: es.SwitchStatement,
) => {
  const innerScope = scope.createScope();
  const refBlock = new Block([]);
  const exitBlock = new Block([]);
  context.connectBlock(refBlock, node);
  innerScope.break = exitBlock;

  const ref = c.handle(scope, context, node.discriminant);

  let nextBodyBlock = new Block([]);
  let nextTestBlock = new Block([]);
  let defaultCaseEntry = new Block([], new BreakInstruction(exitBlock, node));
  context.connectBlock(nextTestBlock, node);

  for (const scase of node.cases) {
    const bodyEntry = nextBodyBlock;
    const testEntry = nextTestBlock;
    nextBodyBlock = new Block([]);

    if (scase.test) {
      nextTestBlock = new Block([]);
      context.currentBlock = testEntry;

      const value = c.handle(scope, context, scase.test);
      const condition = c.generateId();
      context.addInstruction(
        new BinaryOperationInstruction(
          "strictEqual",
          ref,
          value,
          condition,
          scase,
        ),
      );
      context.setEndInstruction(
        new BreakIfInstruction(condition, bodyEntry, nextTestBlock, scase),
      );
    } else {
      // testEntry.endInstruction = new BreakInstruction(bodyEntry);
      defaultCaseEntry = bodyEntry;
    }

    context.currentBlock = bodyEntry;

    c.handleMany(innerScope, context, scase.consequent);

    context.setEndInstruction(new BreakInstruction(nextBodyBlock, node));
  }

  nextTestBlock.endInstruction = new BreakInstruction(defaultCaseEntry, node);
  nextBodyBlock.endInstruction = new BreakInstruction(exitBlock, node);

  context.currentBlock = exitBlock;
  return nullId;
};
