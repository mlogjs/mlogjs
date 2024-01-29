import { CallInstruction } from "../flow";
import { ImmutableId } from "../flow/id";
import { es, THandler } from "../types";
import { LiteralValue, ObjectValue } from "../values";

export const CallExpression: THandler = (
  c,
  scope,
  context,
  node: es.CallExpression,
) => {
  const callee = c.handle(scope, context, node.callee);

  const calleeValue = c.getValue(callee);
  calleeValue?.preCall(scope);
  const args = node.arguments.map(node => {
    return c.handle(scope, context, node);
  });
  calleeValue?.postCall(scope);

  // TODO: update to load from the function's global return value
  const out = new ImmutableId();

  context.addInstruction(new CallInstruction(callee, args, out, node));

  return out;
};

export const NewExpression = CallExpression;

export const TaggedTemplateExpression: THandler = (
  c,
  scope,
  context,
  node: es.TaggedTemplateExpression,
) => {
  //  TODO: handle nested properties of object values
  const tag = c.handle(scope, context, node.tag);

  const template = node.quasi;

  const stringsObject = ObjectValue.fromArray(
    c,
    template.quasis.map(quasi =>
      c.registerValue(new LiteralValue(quasi.value.cooked ?? "")),
    ),
    {
      raw: c.registerValue(
        ObjectValue.fromArray(
          c,
          template.quasis.map(quasi =>
            c.registerValue(new LiteralValue(quasi.value.raw)),
          ),
        ),
      ),
    },
  );

  const stringsObjectId = c.registerValue(stringsObject);

  const expressions: ImmutableId[] = [];

  template.expressions.forEach(expression => {
    const value = c.handle(scope, context, expression);

    expressions.push(value);
  });

  const out = new ImmutableId();
  context.addInstruction(
    new CallInstruction(tag, [stringsObjectId, ...expressions], out, node),
  );

  return out;
};
