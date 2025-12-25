import { BlockCursor, IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { Block, ImmutableId } from "../flow";
import { SourceRange } from "../SourceRange";
import { es, IScope, THandler } from "../types";
import { nodeName } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";

const TypeCastExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.TSAsExpression | es.TSTypeAssertion,
) => {
  return c.handle(scope, cursor, node.expression);
};

export const TSAsExpression = TypeCastExpression;

export const TSTypeAssertion = TypeCastExpression;

const IgnoredHandler: THandler = c => c.nullId;

export const TSInterfaceDeclaration = IgnoredHandler;

export const TSTypeAliasDeclaration = IgnoredHandler;

export const TSEnumDeclaration: THandler = (
  c,
  scope,
  cursor,
  node: es.TSEnumDeclaration,
) => {
  if (!node.const)
    throw new CompilerError(
      "All enums must be declared with the const keyword before enum",
    );
  let counter = 0;
  let lastType: "string" | "number" = "number";

  const data: IObjectValueData = {};

  for (const member of node.members) {
    if (lastType === "string" && !member.initializer)
      throw new CompilerError(
        "This enum member must be initialized",
        SourceRange.fromNode(member),
      );

    const value = member.initializer
      ? evaluateEnumMember(c, scope, cursor, member.initializer)
      : new LiteralValue(counter);

    if (value.isNumber()) {
      lastType = "number";
      counter = value.data + 1;
    } else {
      lastType = "string";
    }

    const name =
      member.id.type === "Identifier" ? member.id.name : member.id.value;
    data[name] = c.registerValue(value);
  }

  const value = new ObjectValue(data);
  const id = c.registerValue(value);
  value.name = nodeName(node, !c.compactNames && node.id.name);

  scope.set(node.id.name, id);

  return id;
};

export const TSNonNullExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.TSNonNullExpression,
) => {
  return c.handle(scope, cursor, node.expression);
};

export const TSSatisfiesExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.TSSatisfiesExpression,
) => c.handle(scope, cursor, node.expression);

function evaluateEnumMember(
  c: ICompilerContext,
  scope: IScope,
  cursor: IBlockCursor,
  initializer: es.Expression,
): LiteralValue {
  const { currentBlock } = cursor;
  const block = new Block();
  cursor.currentBlock = block;
  const id = c.handle(scope, cursor, initializer);
  cursor.currentBlock = currentBlock;

  if (block.endInstruction)
    throw new CompilerError(
      "Enum member initializers cannot contain control flow",
      block.endInstruction.source,
    );

  for (const instruction of block.instructions) {
    if (
      instruction.type !== "binary-operation" &&
      instruction.type !== "unary-operation"
    ) {
      throw new CompilerError(
        "Enum member initializers can only contain constant expressions",
        instruction.source,
      );
    }
    if (!instruction.constantFold(c))
      throw new CompilerError(
        "Enum member initializers can only contain constant expressions",
        instruction.source,
      );
  }

  const value = c.getValue(id);
  if (value instanceof LiteralValue) return new LiteralValue(value.data);
  throw new CompilerError(
    "Enum member initializers must evaluate to literal values",
    SourceRange.fromNode(initializer),
  );
}
