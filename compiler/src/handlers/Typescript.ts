import { CompilerError } from "../CompilerError";
import { es, IValue, THandler, TValueInstructions } from "../types";
import { nodeName } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";

const TypeCastExpression: THandler = (
  c,
  scope,
  node: es.TSAsExpression | es.TSTypeAssertion,
  out,
) => {
  return c.handle(scope, node.expression, undefined, out) as TValueInstructions;
};

export const TSAsExpression = TypeCastExpression;

export const TSTypeAssertion = TypeCastExpression;

const IgnoredHandler: THandler<null> = () => [null, []];

export const TSInterfaceDeclaration = IgnoredHandler;

export const TSTypeAliasDeclaration = IgnoredHandler;

export const TSEnumDeclaration: THandler<null> = (
  c,
  scope,
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
      ? c.handleEval(scope, member.initializer)
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
  node: es.TSNonNullExpression,
  out,
) => {
  return c.handle(scope, node.expression, undefined, out) as TValueInstructions;
};

export const TSSatisfiesExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.TSSatisfiesExpression,
  out,
) => c.handle(scope, node.expression, undefined, out);
