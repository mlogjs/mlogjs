import { JumpInstruction, AddressResolver } from "../instructions";
import { EJumpKind } from "../instructions";
import { THandler, es, IInstruction } from "../types";
import { pipeInsts, withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";

export const IfStatement: THandler<null> = (c, scope, node: es.IfStatement) => {
  const inst: IInstruction[] = [];
  const test = pipeInsts(c.handleEval(scope, node.test), inst);

  if (test instanceof LiteralValue) {
    if (test.data) return [null, c.handle(scope, node.consequent)[1]];
    else if (node.alternate) return [null, c.handle(scope, node.alternate)[1]];
    return [null, []];
  }

  const endIfAddr = new LiteralValue(null);

  inst.push(
    new JumpInstruction(endIfAddr, EJumpKind.Equal, test, new LiteralValue(0)),
    ...withAlwaysRuns(c.handle(scope, node.consequent), false)[1]
  );

  if (!node.alternate) {
    inst.push(new AddressResolver(endIfAddr));
  } else {
    const endElseAddr = new LiteralValue(null);
    inst.push(
      new JumpInstruction(endElseAddr, EJumpKind.Always),
      new AddressResolver(endIfAddr),
      ...withAlwaysRuns(c.handle(scope, node.alternate), false)[1],
      new AddressResolver(endElseAddr)
    );
  }
  return [null, inst];
};
