import { CallInstruction } from "../flow";
import { es, THandler } from "../types";
import { LiteralValue, ObjectValue } from "../values";

export const CallExpression: THandler = (
  c,
  scope,
  context,
  node: es.CallExpression,
) => {
  const callee = c.handle(scope, context, node.callee);

  const args = node.arguments.map(node => {
    return c.handleCopy(scope, context, node);
  });
  const out = c.generateId();

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
    template.quasis.map(quasi => new LiteralValue(quasi.value.cooked ?? "")),
    {
      raw: ObjectValue.fromArray(
        template.quasis.map(quasi => new LiteralValue(quasi.value.raw)),
      ),
    },
  );

  const stringsObjectId = c.registerValue(stringsObject);

  const expressions: number[] = [];

  template.expressions.forEach(expression => {
    const value = c.handleCopy(scope, context, expression);

    expressions.push(value);
  });

  const out = c.generateId();
  context.addInstruction(
    new CallInstruction(tag, [stringsObjectId, ...expressions], out, node),
  );

  return out;
};
