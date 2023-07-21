import { es, IInstruction, IValue, THandler } from "../types";
import { pipeInsts } from "../utils";
import { LiteralValue, ObjectValue } from "../values";

export const CallExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.CallExpression,
  out,
) => {
  const inst: IInstruction[] = [];

  const callee = pipeInsts(c.handleEval(scope, node.callee), inst);

  const paramOuts = callee.preCall(scope, out);

  const args = node.arguments.map((node, index) => {
    const out = paramOuts?.[index];
    return pipeInsts(c.handleEval(scope, node, out), inst);
  });

  const callValue = pipeInsts(callee.call(scope, args, out), inst);

  callee.postCall(scope);

  return [callValue, inst];
};

export const NewExpression = CallExpression;

export const TaggedTemplateExpression: THandler<IValue | null> = (
  c,
  scope,
  node: es.TaggedTemplateExpression,
  out,
) => {
  const [tag, tagInst] = c.handleEval(scope, node.tag);

  const template = node.quasi;

  const stringsObject = ObjectValue.fromArray(
    template.quasis.map(quasi => new LiteralValue(quasi.value.cooked ?? "")),
    {
      raw: ObjectValue.fromArray(
        template.quasis.map(quasi => new LiteralValue(quasi.value.raw)),
      ),
    },
  );

  const expressions: IValue[] = [];
  const expressionInsts: IInstruction[] = [];

  template.expressions.forEach(expression => {
    const value = pipeInsts(c.handleEval(scope, expression), expressionInsts);
    expressions.push(value);
  });

  const [result, resultInst] = tag.call(
    scope,
    [stringsObject, ...expressions],
    out,
  );

  return [result, [...expressionInsts, ...tagInst, ...resultInst]];
};
