import { ICompilerContext } from "../CompilerContext";
import { ImmutableId } from "../flow/id";
import { THandler, es, IScope } from "../types";
import { nodeName } from "../utils";
import { FunctionValue } from "../values/FunctionValue";

function handleFunctionNode(
  c: ICompilerContext,
  scope: IScope,
  node: es.Function,
): ImmutableId {
  let { params, body } = node;

  if (es.isExpression(body)) {
    const { loc } = body;
    const statement = es.returnStatement(body);
    statement.loc = loc;
    body = es.blockStatement([statement]);
    body.loc = loc;
  }

  return c.registerValue(
    new FunctionValue({
      scope,
      params: params as es.Identifier[],
      body,
      c,
    }),
  );
}

export const ArrowFunctionExpression: THandler = (
  c,
  scope,
  context,
  node: es.ArrowFunctionExpression,
) => {
  return handleFunctionNode(c, scope, node);
};

export const FunctionDeclaration: THandler = (
  c,
  scope,
  context,
  node: es.FunctionDeclaration,
) => {
  const identifier = (node.id as es.Identifier).name;
  const name = nodeName(node, !c.compactNames && identifier);

  const functionId = handleFunctionNode(c, scope, node);
  scope.set(name, functionId);
  c.setValueName(functionId, name);
  return functionId;
};

export const FunctionExpression: THandler = ArrowFunctionExpression;
export const ObjectMethod: THandler = ArrowFunctionExpression;
