import {
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
} from "../flow";
import { SourceRange } from "../SourceRange";
import { es, THandler } from "../types";

export const SwitchStatement: THandler = (
  c,
  scope,
  cursor,
  node: es.SwitchStatement,
) => {
  const innerScope = scope.createScope();
  const refBlock = new Block();
  const exitBlock = new Block();
  const loc = SourceRange.fromNode(node);
  cursor.connectBlock(refBlock, loc);
  innerScope.break = exitBlock;

  const ref = c.handle(scope, cursor, node.discriminant);

  let nextBodyBlock = new Block();
  let nextTestBlock = new Block();
  let defaultCaseEntry = new Block(new BreakInstruction(exitBlock, loc));
  cursor.connectBlock(nextTestBlock, loc);

  for (const scase of node.cases) {
    const bodyEntry = nextBodyBlock;
    const testEntry = nextTestBlock;
    nextBodyBlock = new Block();

    if (scase.test) {
      nextTestBlock = new Block();
      cursor.currentBlock = testEntry;

      const value = c.handle(scope, cursor, scase.test);
      const condition = c.createImmutableId();
      const caseLoc = SourceRange.fromNode(scase);
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "strictEqual",
          ref,
          value,
          condition,
          caseLoc,
        ),
      );
      cursor.setEndInstruction(
        new BreakIfInstruction(condition, bodyEntry, nextTestBlock, caseLoc),
      );
    } else {
      // testEntry.endInstruction = new BreakInstruction(bodyEntry);
      defaultCaseEntry = bodyEntry;
    }

    cursor.currentBlock = bodyEntry;

    c.handleMany(innerScope, cursor, scase.consequent);

    cursor.setEndInstruction(new BreakInstruction(nextBodyBlock, loc));
  }

  nextTestBlock.endInstruction = new BreakInstruction(defaultCaseEntry, loc);
  nextBodyBlock.endInstruction = new BreakInstruction(exitBlock, loc);

  cursor.currentBlock = exitBlock;
  return c.nullId;
};
