import { es, IInstruction, IValue, THandler } from "../types";
import { LiteralValue, ObjectValue } from "../values";

export const CallExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.CallExpression,
  out
) => {
  const inst: IInstruction[] = [];

  const [callee, calleeInst] = c.handleEval(scope, node.callee);
  inst.push(...calleeInst);

  const paramOuts = callee.preCall(scope, out);

  const args = node.arguments.map((node, index) => {
    // TODO: this might be why t0 did not increment
    // TODO: figure out if the previous todo is still relevant
    const out = paramOuts?.[index];
    const [v, i] = c.handleEval(scope, node, out);
    inst.push(...i);
    return v;
  });

  const [callValue, callInst] = callee.call(scope, args, out);
  inst.push(...callInst);

  callee.postCall(scope);

  return [callValue, inst];
};

export const NewExpression = CallExpression;

export const TaggedTemplateExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.TaggedTemplateExpression,
  out
) => {
  const [tag, tagInst] = c.handleEval(scope, node.tag);

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
    const [value, inst] = c.handleEval(scope, expression);
    expressions.push(value);
    expressionInsts.push(...inst);
  });

  const [result, resultInst] = tag.call(
    scope,
    [stringsObject, ...expressions],
    out
  );

  return [result, [...expressionInsts, ...tagInst, ...resultInst]];
};
