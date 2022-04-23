import { es, THandler, TValueInstructions } from "../types";

const Expression: THandler = (
  c,
  scope,
  node: es.TSAsExpression | es.TSTypeAssertion
) => {
  return c.handle(scope, node.expression) as TValueInstructions;
};
export const TSAsExpression = Expression;

export const TSTypeAssertion = Expression;
