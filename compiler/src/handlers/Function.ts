import { Compiler } from "../Compiler";
import { CompilerError } from "../CompilerError";
import {
  THandler,
  es,
  IScope,
  TValueInstructions,
  TEOutput,
  EInlineType,
} from "../types";
import { nodeName } from "../utils";
import { FunctionValue } from "../values/FunctionValue";

function handleFunctionNode(
  c: Compiler,
  scope: IScope,
  node: es.Function,
  out?: TEOutput,
): TValueInstructions<FunctionValue> {
  let { params, body } = node;

  if (es.isExpression(body)) {
    const { loc } = body;
    const statement = es.returnStatement(body);
    statement.loc = loc;
    body = es.blockStatement([statement]);
    body.loc = loc;
  }

  const inlineType = getInlineType(body.directives);

  return [
    new FunctionValue({
      scope,
      params,
      body,
      c,
      out,
      inlineType,
    }),
    [],
  ];
}

export const ArrowFunctionExpression: THandler = (
  c,
  scope,
  node: es.ArrowFunctionExpression,
  out,
) => {
  return handleFunctionNode(c, scope, node, out);
};

export const FunctionDeclaration: THandler = (
  c,
  scope,
  node: es.FunctionDeclaration,
) => {
  const identifier = (node.id as es.Identifier).name;
  const name = nodeName(node, !c.compactNames && identifier);
  const functionIns = handleFunctionNode(c, scope, node, name);
  scope.set(identifier, functionIns[0]);
  return functionIns;
};

export const FunctionExpression: THandler = ArrowFunctionExpression;
export const ObjectMethod: THandler = ArrowFunctionExpression;

function getInlineType(directives: es.Directive[]) {
  for (const directive of directives) {
    const value = directive.value.value;

    switch (value) {
      case "inline":
        return EInlineType.always;
      case "inline never":
        return EInlineType.never;
      default:
        throw new CompilerError(`Invalid function directive: "${value}"`);
    }
  }
  return EInlineType.auto;
}
