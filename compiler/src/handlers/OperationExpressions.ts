import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import {
  AllocLocalInstruction,
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
  ImmutableId,
  LoadInstruction,
  StoreInstruction,
  TBinaryOperationType,
  UnaryOperatorInstruction,
} from "../flow";
import { AssignmentOperator } from "../operators";
import { SourceRange } from "../SourceRange";
import { THandler, es } from "../types";
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
  ">>>": "ushr",
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

  return binaryExpression(
    c,
    cursor,
    operator,
    left,
    right,
    SourceRange.fromNode(node),
  );
};

export const LogicalExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.LogicalExpression,
) => {
  const left = c.handle(scope, cursor, node.left);
  return logicalExpression(
    c,
    cursor,
    node.operator,
    left,
    () => c.handle(scope, cursor, node.right),
    SourceRange.fromNode(node),
  );
};

type TrimmedOperator<T extends string> = T extends `${infer U}=` ? U : never;

export const AssignmentExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.AssignmentExpression & {
    operator: AssignmentOperator;
  },
) => {
  // TODO: support the other assignment operators
  const handler = c.handleWriteable(scope, cursor, node.left);

  const operator = node.operator;

  let value: ImmutableId;
  switch (node.operator) {
    case "=": {
      value = c.handle(scope, cursor, node.right);
      break;
    }
    case "??=":
    case "||=":
    case "&&=": {
      const left = handler.read();
      value = logicalExpression(
        c,
        cursor,
        operator.slice(0, 2) as es.LogicalExpression["operator"],
        left,
        () => c.handle(scope, cursor, node.right),
        SourceRange.fromNode(node),
      );
      break;
    }
    case "%=":
    case "*=":
    case "+=":
    case "-=":
    case "/=":
    case "<<=":
    case ">>=":
    case ">>>=":
    case "&=":
    case "^=":
    case "**=":
    case "|=": {
      const left = handler.read();
      const right = c.handle(scope, cursor, node.right);

      value = binaryExpression(
        c,
        cursor,
        operator.slice(0, -1) as es.BinaryExpression["operator"],
        left,
        right,
        SourceRange.fromNode(node),
      );
    }
  }

  handler.write(value, node);
  return value;
};

export const UnaryExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.UnaryExpression,
) => {
  const out = c.createImmutableId();
  const value = c.handle(scope, cursor, node.argument);
  const loc = SourceRange.fromNode(node);

  switch (node.operator) {
    case "void":
      return c.nullId;
    case "!":
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "equal",
          value,
          c.registerValue(new LiteralValue(0)),
          out,
          loc,
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
          loc,
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
          loc,
        ),
      );
      break;
    case "~":
      cursor.addInstruction(
        new UnaryOperatorInstruction("not", value, out, loc),
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
  const handler = c.handleWriteable(scope, cursor, node.argument);

  const oldValue = handler.read();
  const newValue = c.createImmutableId();
  const one = c.registerValue(new LiteralValue(1));
  const loc = SourceRange.fromNode(node);

  cursor.addInstruction(
    new BinaryOperationInstruction(
      node.operator === "++" ? "add" : "sub",
      oldValue,
      one,
      newValue,
      loc,
    ),
  );
  handler.write(newValue, node);

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
  const loc = SourceRange.fromNode(node);

  const out = c.createGlobalId();
  cursor.addInstruction(new AllocLocalInstruction(out, loc));

  cursor.connectBlock(testBlock, loc);
  const test = c.handle(scope, cursor, node.test);
  cursor.setEndInstruction(
    new BreakIfInstruction(test, consequentBlock, alternateBlock, loc),
  );

  cursor.currentBlock = consequentBlock;
  const consequent = c.handle(scope, cursor, node.consequent);
  cursor.addInstruction(new StoreInstruction(out, consequent, loc));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, loc));

  cursor.currentBlock = alternateBlock;
  const alternate = c.handle(scope, cursor, node.alternate);
  cursor.addInstruction(new StoreInstruction(out, alternate, loc));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, loc));

  cursor.currentBlock = exitBlock;
  const immutableOut = c.createImmutableId();
  cursor.addInstruction(new LoadInstruction(out, immutableOut, loc));

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

function binaryExpression(
  c: ICompilerContext,
  cursor: IBlockCursor,
  operator: es.BinaryExpression["operator"],
  left: ImmutableId,
  right: ImmutableId,
  loc: SourceRange,
) {
  const out = c.createImmutableId();

  if (operator === "!==") {
    const temp = c.createImmutableId();
    const zero = c.registerValue(new LiteralValue(0));
    cursor.addInstruction(
      new BinaryOperationInstruction("strictEqual", left, right, temp, loc),
    );
    cursor.addInstruction(
      new BinaryOperationInstruction("equal", temp, zero, out, loc),
    );
    return out;
  }

  const type = binaryOperatorMap[operator];
  if (!type)
    throw new CompilerError(`The operator ${operator} is not supported`);

  cursor.addInstruction(
    new BinaryOperationInstruction(type, left, right, out, loc),
  );

  return out;
}

function logicalExpression(
  c: ICompilerContext,
  cursor: IBlockCursor,
  operator: es.LogicalExpression["operator"],
  left: ImmutableId,
  handleRight: () => ImmutableId,
  loc: SourceRange,
) {
  const out = c.createGlobalId();
  cursor.addInstruction(new AllocLocalInstruction(out, loc));
  const alternateBlock = new Block();
  const exitBlock = new Block();

  cursor.addInstruction(new StoreInstruction(out, left, loc));
  switch (operator) {
    case "&&":
      cursor.setEndInstruction(
        new BreakIfInstruction(left, alternateBlock, exitBlock, loc),
      );
      break;
    case "||":
      cursor.setEndInstruction(
        new BreakIfInstruction(left, exitBlock, alternateBlock, loc),
      );
      break;
    case "??": {
      const test = c.createImmutableId();
      cursor.addInstruction(new StoreInstruction(out, left, loc));
      cursor.addInstruction(
        new BinaryOperationInstruction(
          "strictEqual",
          left,
          c.nullId,
          test,
          loc,
        ),
      );
      cursor.setEndInstruction(
        new BreakIfInstruction(test, alternateBlock, exitBlock, loc),
      );
    }
  }

  cursor.currentBlock = alternateBlock;
  const right = handleRight();
  cursor.addInstruction(new StoreInstruction(out, right, loc));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, loc));

  cursor.currentBlock = exitBlock;
  const immutableOut = c.createImmutableId();
  cursor.addInstruction(new LoadInstruction(out, immutableOut, loc));

  return immutableOut;
}
