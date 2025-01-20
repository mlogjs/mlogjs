import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { ImmutableId } from "../flow/id";
import { CompilerError } from "../CompilerError";
import { THandler, es, IScope, EInlineType } from "../types";
import { nodeName } from "../utils";
import { FunctionValue } from "../values/FunctionValue";

function handleFunctionNode(
  c: ICompilerContext,
  scope: IScope,
  cursor: IBlockCursor,
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

  const id = c.createImmutableId();

  c.setValue(
    id,
    new FunctionValue({
      scope,
      params,
      id,
      body,
      c,
    }),
  );

  return id;
}

export const ArrowFunctionExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.ArrowFunctionExpression,
) => {
  return handleFunctionNode(c, scope, cursor, node);
};

export const FunctionDeclaration: THandler = (
  c,
  scope,
  cursor,
  node: es.FunctionDeclaration,
) => {
  const identifier = (node.id as es.Identifier).name;
  const name = nodeName(node, !c.compactNames && identifier);

  const functionId = handleFunctionNode(c, scope, cursor, node);
  scope.set(name, functionId);
  c.setValueName(functionId, name);
  return functionId;
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
