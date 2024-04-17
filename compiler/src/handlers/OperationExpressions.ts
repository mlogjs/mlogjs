import { CompilerError } from "../CompilerError";
import {
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
  GlobalId,
  ImmutableId,
  LoadInstruction,
  StoreInstruction,
  TBinaryOperationType,
  UnaryOperatorInstruction,
} from "../flow";
import { AssignementOperator } from "../operators";
import { THandler, es } from "../types";
import { nullId } from "../utils";
import { LiteralValue } from "../values";

const binaryOperatorMap: Partial<
  Record<es.BinaryExpression["operator"], TBinaryOperationType>
> = {
  "!=": "notEqual",
  "==": "equal",
  "===": "strictEqual",
  ">=": "greaterThanEq",
  ">": "greaterThan",
  "<=": "lessThanEq",
  "<": "lessThan",
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
  "%": "mod",
  "**": "pow",
  "&": "land",
  "|": "or",
  "^": "xor",
  "<<": "shl",
  ">>": "shr",
};

export const BinaryExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.BinaryExpression,
) => {
  const left = c.handle(scope, cursor, node.left);
  const right = c.handle(scope, cursor, node.right);
  const operator = node.operator;
  const out = new ImmutableId();

  if (operator === "!==") {
    const temp = new ImmutableId();
    const zero = c.registerValue(new LiteralValue(0));
    cursor.addInstruction(
      new BinaryOperationInstruction("strictEqual", left, right, temp, node),
    );
    cursor.addInstruction(
      new BinaryOperationInstruction("equal", temp, zero, out, node),
    );
    return out;
  }

  const type = binaryOperatorMap[operator];
  if (!type)
    throw new CompilerError(`The operator ${operator} is not supported`);

  cursor.addInstruction(
    new BinaryOperationInstruction(type, left, right, out, node),
  );

  return out;
};

export const LogicalExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.LogicalExpression,
) => {
  const out = new GlobalId();
  const alternateBlock = new Block();
  const exitBlock = new Block();

  const left = c.handle(scope, cursor, node.left);
  cursor.addInstruction(new StoreInstruction(out, left, node));
  switch (node.operator) {
    case "&&":
      cursor.setEndInstruction(
        new BreakIfInstruction(left, alternateBlock, exitBlock, node),
      );
      break;
    case "||":
      cursor.setEndInstruction(
        new BreakIfInstruction(left, exitBlock, alternateBlock, node),
      );
      break;
    case "??": {
      const test = new ImmutableId();
      const temp = new ImmutableId();
      cursor.addInstruction(
        new BinaryOperationInstruction("strictEqual", temp, nullId, test, node),
      );
      cursor.addInstruction(new StoreInstruction(out, temp, node));
      cursor.setEndInstruction(
        new BreakIfInstruction(test, alternateBlock, exitBlock, node),
      );
    }
  }

  cursor.currentBlock = alternateBlock;
  const right = c.handle(scope, cursor, node.right);
  cursor.addInstruction(new StoreInstruction(out, right, node));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

  cursor.currentBlock = exitBlock;
  const immutableOut = new ImmutableId();
  cursor.addInstruction(new LoadInstruction(out, immutableOut, node));

  return immutableOut;
};

export const AssignmentExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.AssignmentExpression & {
    operator: AssignementOperator;
  },
) => {
  // TODO: support the other assignment operators
  const assign = c.handleWrite(scope, cursor, node.left);

  const value = c.handle(scope, cursor, node.right);

  assign(value, node);
  return value;
};

export const UnaryExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.UnaryExpression,
) => {
  const out = new ImmutableId();
  const value = c.handle(scope, cursor, node.argument);

  switch (node.operator) {
    case "void":
      return nullId;
    case "!":
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "equal",
          value,
          c.registerValue(new LiteralValue(0)),
          out,
          node,
        ),
      );
      break;
    case "+":
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "add",
          value,
          c.registerValue(new LiteralValue(0)),
          out,
          node,
        ),
      );
      break;
    case "-":
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "sub",
          c.registerValue(new LiteralValue(0)),
          value,
          out,
          node,
        ),
      );
      break;
    case "~":
      cursor.addInstruction(
        new UnaryOperatorInstruction("not", value, out, node),
      );
      break;
    case "throw":
    case "delete":
    case "typeof":
      throw new CompilerError(
        `The operator "${node.operator}" is not supported`,
      );
  }
  return out;
};
export const UpdateExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.UpdateExpression,
) => {
  const assign = c.handleWrite(scope, cursor, node.argument);

  const oldValue = c.handle(scope, cursor, node.argument);
  const newValue = new ImmutableId();
  const one = c.registerValue(new LiteralValue(1));

  cursor.addInstruction(
    new BinaryOperationInstruction(
      node.operator === "++" ? "add" : "sub",
      oldValue,
      one,
      newValue,
      node,
    ),
  );
  assign(newValue, node);

  if (node.prefix) return newValue;
  return oldValue;
};

// TODO: use the select instruction once we have an optimizer
export const ConditionalExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.ConditionalExpression,
) => {
  const testBlock = new Block();
  const consequentBlock = new Block();
  const alternateBlock = new Block();
  const exitBlock = new Block();

  const out = new GlobalId();

  cursor.connectBlock(testBlock, node);
  const test = c.handle(scope, cursor, node.test);
  cursor.setEndInstruction(
    new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
  );

  cursor.currentBlock = consequentBlock;
  const consequent = c.handle(scope, cursor, node.consequent);
  cursor.addInstruction(new StoreInstruction(out, consequent, node));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

  cursor.currentBlock = alternateBlock;
  const alternate = c.handle(scope, cursor, node.alternate);
  cursor.addInstruction(new StoreInstruction(out, alternate, node));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

  cursor.currentBlock = exitBlock;
  const immutableOut = new ImmutableId();
  cursor.addInstruction(new LoadInstruction(out, immutableOut, node));

  return immutableOut;
};

export const SequenceExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.SequenceExpression,
) => {
  const { expressions } = node;

  // compute every expression except the last one
  for (let i = 0; i < expressions.length - 1; i++) {
    c.handle(scope, cursor, expressions[i]);
  }

  return c.handle(scope, cursor, expressions[expressions.length - 1]);
};
