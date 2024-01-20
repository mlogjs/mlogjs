import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { HandlerContext } from "../HandlerContext";
import {
  AssignmentInstruction,
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
  TBinaryOperationType,
  UnaryOperatorInstruction,
  ValueGetInstruction,
  ValueSetInstruction,
} from "../flow";
import { AssignementOperator } from "../operators";
import { THandler, es, IScope } from "../types";
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
  const left = c.handleCopy(scope, context, node.left);
  const right = c.handleCopy(scope, context, node.right);
  const operator = node.operator;
  const out = c.generateId();

  if (operator === "!==") {
    const temp = c.generateId();
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
  const out = c.generateId();
  const alternateBlock = new Block([]);
  const exitBlock = new Block([]);

  const left = c.handle(scope, context, node.left);
  context.addInstruction(new AssignmentInstruction(out, left, node));
  switch (node.operator) {
    case "&&":
      context.setEndInstruction(
        new BreakIfInstruction(out, alternateBlock, exitBlock, node),
      );
      break;
    case "||":
      context.setEndInstruction(
        new BreakIfInstruction(out, exitBlock, alternateBlock, node),
      );
      break;
    case "??": {
      const test = c.generateId();

      context.addInstruction(
        new BinaryOperationInstruction("strictEqual", out, nullId, test, node),
      );
      context.setEndInstruction(
        new BreakIfInstruction(test, alternateBlock, exitBlock, node),
      );
    }
  }

  context.currentBlock = alternateBlock;
  const right = c.handle(scope, context, node.right);
  context.addInstruction(new AssignmentInstruction(out, right, node));
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = exitBlock;

  return out;
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
  const out = c.generateId();
  const value = c.handle(scope, context, node.argument);

  switch (node.operator) {
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
    case "void":
      context.addInstruction(new AssignmentInstruction(out, nullId, node));
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

  const oldValue = c.handleCopy(scope, context, node.argument);
  const newValue = c.generateId();
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

  const out = c.generateId();

  context.connectBlock(testBlock, node);
  const test = c.handle(scope, context, node.test);
  context.setEndInstruction(
    new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
  );

  context.currentBlock = consequentBlock;
  const consequent = c.handle(scope, context, node.consequent);
  context.addInstruction(new AssignmentInstruction(out, consequent, node));
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = alternateBlock;
  const alternate = c.handle(scope, context, node.alternate);
  context.addInstruction(new AssignmentInstruction(out, alternate, node));
  context.setEndInstruction(new BreakInstruction(exitBlock, node));

  context.currentBlock = exitBlock;
  return out;
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
