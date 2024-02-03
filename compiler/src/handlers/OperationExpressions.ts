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
  context,
  node: es.BinaryExpression,
) => {
  const left = c.handle(scope, context, node.left);
  const right = c.handle(scope, context, node.right);
  const operator = node.operator;
  const out = new ImmutableId();

  if (operator === "!==") {
    const temp = new ImmutableId();
    const zero = c.registerValue(new LiteralValue(0));
    context.addInstruction(
      new BinaryOperationInstruction("strictEqual", left, right, temp, node),
    );
    context.addInstruction(
      new BinaryOperationInstruction("equal", temp, zero, out, node),
    );
    return out;
  }

  const type = binaryOperatorMap[operator];
  if (!type)
    throw new CompilerError(`The operator ${operator} is not supported`);

  context.addInstruction(
    new BinaryOperationInstruction(type, left, right, out, node),
  );

  return out;
};

export const LogicalExpression: THandler = (
  c,
  scope,
  context,
  node: es.LogicalExpression,
) => {
  const out = new GlobalId();
  const alternateBlock = new Block([]);
  const exitBlock = new Block([]);

  const left = c.handle(scope, context, node.left);
  context.addInstruction(new StoreInstruction(out, left, node));
  switch (node.operator) {
    case "&&":
      context.setEndInstruction(
        new BreakIfInstruction(left, alternateBlock, exitBlock, node),
      );
      break;
    case "||":
      context.setEndInstruction(
        new BreakIfInstruction(left, exitBlock, alternateBlock, node),
      );
      break;
    case "??": {
      const test = new ImmutableId();
      const temp = new ImmutableId();
      context.addInstruction(
        new BinaryOperationInstruction("strictEqual", temp, nullId, test, node),
      );
      context.addInstruction(new StoreInstruction(out, temp, node));
      context.setEndInstruction(
        new BreakIfInstruction(test, alternateBlock, exitBlock, node),
      );
    }
  }

  context.currentBlock = alternateBlock;
  const right = c.handle(scope, context, node.right);
  context.addInstruction(new StoreInstruction(out, right, node));
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = exitBlock;
  const immutableOut = new ImmutableId();
  context.addInstruction(new LoadInstruction(out, immutableOut, node));

  return immutableOut;
};

export const AssignmentExpression: THandler = (
  c,
  scope,
  context,
  node: es.AssignmentExpression & {
    operator: AssignementOperator;
  },
) => {
  const assign = c.handleWrite(scope, context, node.left);

  const value = c.handle(scope, context, node.right);

  assign(value, node);
  return value;
};

export const UnaryExpression: THandler = (
  c,
  scope,
  context,
  node: es.UnaryExpression,
) => {
  const out = new ImmutableId();
  const value = c.handle(scope, context, node.argument);

  switch (node.operator) {
    case "void":
      return nullId;
    case "!":
      context.addInstruction(
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
      context.addInstruction(
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
      context.addInstruction(
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
      context.addInstruction(
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
  context,
  node: es.UpdateExpression,
) => {
  const assign = c.handleWrite(scope, context, node.argument);

  const oldValue = c.handle(scope, context, node.argument);
  const newValue = new ImmutableId();
  const one = c.registerValue(new LiteralValue(1));

  context.addInstruction(
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

export const ConditionalExpression: THandler = (
  c,
  scope,
  context,
  node: es.ConditionalExpression,
) => {
  const testBlock = new Block([]);
  const consequentBlock = new Block([]);
  const alternateBlock = new Block([]);
  const exitBlock = new Block([]);

  const out = new GlobalId();

  context.connectBlock(testBlock, node);
  const test = c.handle(scope, context, node.test);
  context.setEndInstruction(
    new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
  );

  context.currentBlock = consequentBlock;
  const consequent = c.handle(scope, context, node.consequent);
  context.addInstruction(new StoreInstruction(out, consequent, node));
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = alternateBlock;
  const alternate = c.handle(scope, context, node.alternate);
  context.addInstruction(new StoreInstruction(out, alternate, node));
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = exitBlock;
  const immutableOut = new ImmutableId();
  context.addInstruction(new LoadInstruction(out, immutableOut, node));

  return immutableOut;
};

export const SequenceExpression: THandler = (
  c,
  scope,
  context,
  node: es.SequenceExpression,
) => {
  const { expressions } = node;

  // compute every expression except the last one
  for (let i = 0; i < expressions.length - 1; i++) {
    c.handle(scope, context, expressions[i]);
  }

  return c.handle(scope, context, expressions[expressions.length - 1]);
};
