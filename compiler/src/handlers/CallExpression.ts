import { es, IInstruction, IValue, THandler } from "../types";
import { LiteralValue, ObjectValue } from "../values";

export const CallExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.CallExpression
) => {
  const inst: IInstruction[] = [];

  const args = node.arguments.map(node => {
    // TODO: this might be why t0 did not increment
    // TODO: figure out if the previous todo is still relevant
    const [v, i] = c.handleConsume(scope, node);
    inst.push(...i);
    return v;
  });

  const [callee, calleeInst] = c.handleConsume(scope, node.callee);
  inst.push(...calleeInst);

  const [callValue, callInst] = callee.call(scope, args);
  inst.push(...callInst);

  return [callValue, inst];
};

export const NewExpression = CallExpression;

export const TaggedTemplateExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.TaggedTemplateExpression
) => {
  const [tag, tagInst] = c.handleConsume(scope, node.tag);

  const template = node.quasi;

  const stringsObject = ObjectValue.fromArray(
    template.quasis.map(quasi => new LiteralValue(quasi.value.cooked ?? "")),
    {
      raw: ObjectValue.fromArray(
        template.quasis.map(quasi => new LiteralValue(quasi.value.raw))
      ),
    }
  );

  const expressions: IValue[] = [];
  const expressionInsts: IInstruction[] = [];

  template.expressions.forEach(expression => {
    const [value, inst] = c.handleConsume(scope, expression);
    expressions.push(value);
    expressionInsts.push(...inst);
  });

  const [result, resultInst] = tag.call(scope, [stringsObject, ...expressions]);

  return [result, [...expressionInsts, ...tagInst, ...resultInst]];
};
