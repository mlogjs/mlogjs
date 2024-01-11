import { CompilerError } from "../CompilerError";
import { es, THandler } from "../types";
import { nodeName, nullId } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";

const TypeCastExpression: THandler = (
  c,
  scope,
  context,
  node: es.TSAsExpression | es.TSTypeAssertion,
) => {
  return c.handle(scope, context, node.expression);
};

export const TSAsExpression = TypeCastExpression;

export const TSTypeAssertion = TypeCastExpression;

const IgnoredHandler: THandler = () => nullId;

export const TSInterfaceDeclaration = IgnoredHandler;

export const TSTypeAliasDeclaration = IgnoredHandler;

export const TSEnumDeclaration: THandler = (
  c,
  scope,
  context,
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
      throw new CompilerError("This enum member must be initialized", member);

    const [value] = member.initializer
      ? c.handle(scope, member.initializer)
      : [new LiteralValue(counter)];

    if (!(value instanceof LiteralValue))
      throw new CompilerError(
        "Enum members must contain literal values",
        member,
      );

    if (value.isNumber()) {
      lastType = "number";
      counter = value.data + 1;
    } else {
      lastType = "string";
    }

    const name =
      member.id.type === "Identifier" ? member.id.name : member.id.value;
    data[name] = value;
  }

  const value = new ObjectValue(data);
  value.name = nodeName(node, !c.compactNames && node.id.name);

  scope.set(node.id.name, value);

  return [null, []];
};

export const TSNonNullExpression: THandler = (
  c,
  scope,
  context,
  node: es.TSNonNullExpression,
) => {
  return c.handle(scope, context, node.expression);
};

export const TSSatisfiesExpression: THandler = (
  c,
  scope,
  context,
  node: es.TSSatisfiesExpression,
) => c.handle(scope, context, node.expression);
