import { Compiler } from "../Compiler";
import { THandler, es, IScope, TValueInstructions } from "../types";
import { nodeName } from "../utils";
import { StoreValue } from "../values";
import { FunctionValue } from "../values/FunctionValue";

function handleFunctionNode(
  c: Compiler,
  scope: IScope,
  node: es.Function,
  name: string
): TValueInstructions<FunctionValue> {
  const functionScope = scope.createFunction(name);
  let { params, body } = node;

  if ("expression" in node && node.expression) {
    body = {
      type: "BlockStatement",
      body: [
        { ...body, type: "ReturnStatement", argument: body as es.Expression },
      ],
    } as es.BlockStatement;
  }

  const paramNames = [];
  const paramStores: StoreValue[] = [];

  for (const id of params as es.Identifier[]) {
    paramNames.push(id.name);
    paramStores.push(
      functionScope.make(
        id.name,
        c.compactNames ? nodeName(id) : functionScope.formatName(id.name)
      )
    );
  }

  return [
    new FunctionValue({
      scope: functionScope,
      name,
      paramNames,
      paramStores,
      body: body as es.BlockStatement,
      c,
      renameable: true,
    }),
    [],
  ];
}

export const ArrowFunctionExpression: THandler = (
  c,
  scope,
  node: es.ArrowFunctionExpression
) => {
  const name = nodeName(node);
  return handleFunctionNode(c, scope, node, name);
};

export const FunctionDeclaration: THandler = (
  c,
  scope,
  node: es.FunctionDeclaration
) => {
  const name = (node.id as es.Identifier).name;
  const functionIns = handleFunctionNode(
    c,
    scope,
    node,
    c.compactNames ? nodeName(node) : scope.formatName(name)
  );
  return [scope.set(name, functionIns[0]), []];
};

export const FunctionExpression: THandler = ArrowFunctionExpression;
export const ObjectMethod: THandler = ArrowFunctionExpression;
