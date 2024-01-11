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
  // TODO: handle object members and other stuff
  //  TODO: handle other operators
  const { left } = node;
  if (left.type !== "Identifier")
    throw new CompilerError(
      "Only identifiers are supported for assignment expressions",
      left,
    );

  const leftId = c.handle(scope, context, left);
  const value = c.handle(scope, context, node.right);
  context.addInstruction(new AssignmentInstruction(leftId, value, node));
  return value;

  // type TOp = typeof node["operator"] extends  `${infer T}=` ? T : never;
  // if (node.left.type === "RestElement") throw "foo";
  // const leftValue = c.handle(scope, context, node.left);
  // const assign = handleLval(c, scope, context, node.left);

  // n.loc = node.loc;
  // const [left, leftInst] = c.handleValue(scope, node.left);

  // const leftOutput = left.toOut();
  // const [right, rightInst] = !logicalAssignmentOperators.includes(node.operator)
  //   ? c.handleEval(
  //       scope,
  //       node.right,
  //       node.operator === "=" ? leftOutput : undefined,
  //     )
  //   : [new LazyValue((scope, out) => c.handleEval(scope, node.right, out)), []];

  // const [op, opInst] = left[node.operator](scope, right);
  // return [op, [...leftInst, ...rightInst, ...opInst]];
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
  const { argument } = node;

  //   TODO: handle object members and other stuff
  if (argument.type !== "Identifier")
    throw new CompilerError(
      "Only identifiers are supported for update expressions",
      argument,
    );

  const id = c.handle(scope, context, argument);
  const temp = c.generateId();
  const one = c.registerValue(new LiteralValue(1));

  context.addInstruction(new AssignmentInstruction(temp, id, node));

  context.addInstruction(
    new BinaryOperationInstruction(
      node.operator === "++" ? "add" : "sub",
      id,
      one,
      id,
      node,
    ),
  );
  if (node.prefix) return id;
  return temp;
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

function handleLval(
  c: ICompilerContext,
  scope: IScope,
  context: HandlerContext,
  node: es.LVal,
): (value: number, node: es.Node) => void {
  switch (node.type) {
    case "Identifier": {
      const variable = c.handle(scope, context, node);
      return (value, node) => {
        context.addInstruction(
          new AssignmentInstruction(variable, value, node),
        );
      };
    }
    case "MemberExpression": {
      const object = c.handle(scope, context, node.object);
      let key: number;
      if (node.computed) {
        key = c.generateId();
        // storing in temporary variable in case the original key is mutated later
        const temp = c.handle(scope, context, node.property);
        context.addInstruction(new AssignmentInstruction(key, temp, node));
      } else {
        key = c.registerValue(
          new LiteralValue((node.property as es.Identifier).name),
        );
      }
      return (value, node) => {
        context.addInstruction(
          new ValueSetInstruction(object, key, value, node),
        );
      };
    }
    case "AssignmentPattern": {
      const assign = handleLval(c, scope, context, node.left);

      const testBlock = new Block([]);
      const consequentBlock = new Block([]);
      const alternateBlock = new Block([]);
      const exitBlock = new Block([]);

      const { right } = node;
      return (value, node) => {
        context.connectBlock(testBlock, node);

        const test = c.generateId();
        const temp = c.generateId();

        context.addInstruction(
          new BinaryOperationInstruction(
            "strictEqual",
            value,
            nullId,
            test,
            node,
          ),
        );

        context.setEndInstruction(
          new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
        );

        context.currentBlock = consequentBlock;
        const rightValue = c.handle(scope, context, right);
        context.addInstruction(
          new AssignmentInstruction(temp, rightValue, node),
        );
        context.setEndInstruction(new BreakInstruction(exitBlock, node));

        context.currentBlock = alternateBlock;
        context.addInstruction(new AssignmentInstruction(temp, value, node));
        context.setEndInstruction(new BreakInstruction(exitBlock, node));

        context.currentBlock = exitBlock;

        assign(temp, node);
      };
    }

    case "ArrayPattern": {
      const { elements } = node;
      const assign = elements.map(element => {
        if (!element) return null;
        return handleLval(c, scope, context, element);
      });
      return (value, node) => {
        for (let i = 0; i < assign.length; i++) {
          const temp = c.generateId();
          const key = c.registerValue(new LiteralValue(i));
          context.addInstruction(
            new ValueGetInstruction(value, key, temp, node),
          );
          assign[i]?.(temp, node);
        }
      };
    }
    case "ObjectPattern":
    case "TSParameterProperty":
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "TSTypeAssertion":
    case "TSNonNullExpression":
    case "RestElement":
      throw new CompilerError("The operator is not supported");
  }
}
