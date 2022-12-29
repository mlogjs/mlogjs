import { JumpInstruction, AddressResolver } from "../instructions";
import { EJumpKind } from "../instructions";
import { THandler, es, IInstruction, EInstIntent } from "../types";
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
  const consequent = withAlwaysRuns(c.handle(scope, node.consequent), false);

  inst.push(
    new JumpInstruction(endIfAddr, EJumpKind.Equal, test, new LiteralValue(0)),
    ...consequent[1]
  );

  if (!node.alternate) {
    inst.push(new AddressResolver(endIfAddr));
  } else {
    const endElseAddr = new LiteralValue(null);
    const needsJump = !endsWithControlFlow(consequent[1]);

    if (needsJump)
      inst.push(new JumpInstruction(endElseAddr, EJumpKind.Always));

    inst.push(
      new AddressResolver(endIfAddr),
      ...withAlwaysRuns(c.handle(scope, node.alternate), false)[1]
    );

    if (needsJump) inst.push(new AddressResolver(endElseAddr));
  }
  return [null, inst];
};

/**
 * Returns `true` if the instruction array ends with an instruction
 * that already changes the control flow of the script (like `jump x always`, `end` , `stop`, etc)
 */
function endsWithControlFlow(inst: IInstruction[]) {
  for (let i = inst.length - 1; i >= 0; i--) {
    const instruction = inst[i];
    if (instruction instanceof AddressResolver) return false;
    if (instruction.hidden) continue;

    return instruction.intent !== EInstIntent.none;
  }
  return false;
}
