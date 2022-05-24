import { es, IInstruction, IValue, THandler } from "../types";

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
