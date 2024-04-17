import {
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
  ImmutableId,
} from "../flow";
import { es, THandler } from "../types";
import { nullId } from "../utils";

export const SwitchStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.SwitchStatement,
) => {
  const innerScope = scope.createScope();
  const refBlock = new Block();
  const exitBlock = new Block();
  cursor.connectBlock(refBlock, node);
  innerScope.break = exitBlock;

  const ref = c.handle(scope, cursor, node.discriminant);

  let nextBodyBlock = new Block();
  let nextTestBlock = new Block();
  let defaultCaseEntry = new Block(new BreakInstruction(exitBlock, node));
  cursor.connectBlock(nextTestBlock, node);

  for (const scase of node.cases) {
    const bodyEntry = nextBodyBlock;
    const testEntry = nextTestBlock;
    nextBodyBlock = new Block();

    if (scase.test) {
      nextTestBlock = new Block();
      cursor.currentBlock = testEntry;

      const value = c.handle(scope, cursor, scase.test);
      const condition = new ImmutableId();
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "strictEqual",
          ref,
          value,
          condition,
          scase,
        ),
      );
      cursor.setEndInstruction(
        new BreakIfInstruction(condition, bodyEntry, nextTestBlock, scase),
      );
    } else {
      // testEntry.endInstruction = new BreakInstruction(bodyEntry);
      defaultCaseEntry = bodyEntry;
    }

    cursor.currentBlock = bodyEntry;

    c.handleMany(innerScope, cursor, scase.consequent);

    cursor.setEndInstruction(new BreakInstruction(nextBodyBlock, node));
  }

  nextTestBlock.endInstruction = new BreakInstruction(defaultCaseEntry, node);
  nextBodyBlock.endInstruction = new BreakInstruction(exitBlock, node);

  cursor.currentBlock = exitBlock;
  return nullId;
};
