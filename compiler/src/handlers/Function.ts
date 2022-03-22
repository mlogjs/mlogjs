import { THandler, es } from "../types";
import { nodeName } from "../utils";
import { StoreValue } from "../values";
import { FunctionValue } from "../values/FunctionValue";

export const ArrowFunctionExpression: THandler = (
  c,
  scope,
  node: es.ArrowFunctionExpression
) => {
  const name = nodeName(node);
  const functionScope = scope.createFunction(name);
  let { params, body } = node;

  if (node.expression) {
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
};

export const FunctionDeclaration: THandler = (
  c,
  scope,
  node: es.FunctionDeclaration
) => {
  const functionIns = ArrowFunctionExpression(c, scope, node, null);
  const name = (node.id as es.Identifier).name;
  functionIns[0].rename?.(
    c.compactNames ? nodeName(node) : scope.formatName(name)
  );
  return [scope.set(name, functionIns[0]), []];
};

export const FunctionExpression: THandler = ArrowFunctionExpression;
export const ObjectMethod: THandler = ArrowFunctionExpression;
