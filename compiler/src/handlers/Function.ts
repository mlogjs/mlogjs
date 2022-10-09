import { Compiler } from "../Compiler";
import { THandler, es, IScope, TValueInstructions } from "../types";
import { nodeName } from "../utils";
import { FunctionValue } from "../values/FunctionValue";
import { ValueOwner } from "../values/ValueOwner";

function handleFunctionNode(
  c: Compiler,
  scope: IScope,
  node: es.Function
): TValueInstructions<FunctionValue> {
  let { params, body } = node;

  if (es.isExpression(body)) {
    const { loc } = body;
    const statement = es.returnStatement(body);
    statement.loc = loc;
    body = es.blockStatement([statement]);
    body.loc = loc;
  }

  return [
    new FunctionValue({
      scope,
      params: params as es.Identifier[],
      body,
      c,
    }),
    [],
  ];
}

export const ArrowFunctionExpression: THandler = (
  c,
  scope,
  node: es.ArrowFunctionExpression
) => {
  return handleFunctionNode(c, scope, node);
};

export const FunctionDeclaration: THandler = (
  c,
  scope,
  node: es.FunctionDeclaration
) => {
  const identifier = (node.id as es.Identifier).name;
  const name = nodeName(node, !c.compactNames && identifier);
  const functionIns = handleFunctionNode(c, scope, node);
  const owner = new ValueOwner({
    scope,
    value: functionIns[0],
    identifier,
    name,
  });
  return [scope.set(owner), []];
};

export const FunctionExpression: THandler = ArrowFunctionExpression;
export const ObjectMethod: THandler = ArrowFunctionExpression;
