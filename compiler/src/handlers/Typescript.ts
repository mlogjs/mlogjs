import { es, THandler, TValueInstructions } from "../types";

const TypeCastExpression: THandler = (
  c,
  scope,
  node: es.TSAsExpression | es.TSTypeAssertion
) => {
  return c.handle(scope, node.expression) as TValueInstructions;
};

export const TSAsExpression = TypeCastExpression;

export const TSTypeAssertion = TypeCastExpression;

const IgnoredHandler: THandler<null> = () => [null, []];

export const TSInterfaceDeclaration = IgnoredHandler;

export const TSTypeAliasDeclaration = IgnoredHandler;
