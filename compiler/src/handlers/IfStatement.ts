import { Compiler } from "../Compiler";
import { JumpInstruction, AddressResolver } from "../instructions";
import { EJumpKind } from "../instructions";
import {
  THandler,
  es,
  IInstruction,
  EInstIntent,
  IScope,
  IBindableValue,
  TValueInstructions,
  IValue,
} from "../types";
import { pipeInsts, withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";
import { JumpOutValue } from "../values/JumpOutValue";

export const IfStatement: THandler<null> = (c, scope, node: es.IfStatement) => {
  const inst: IInstruction[] = [];
  const endIfAddr = new LiteralValue(null);
  const testOut = createJumpOut(c, scope, node, endIfAddr);
  const mergedJumps = testOut.whenTrue;

  const test = pipeInsts(c.handleEval(scope, node.test, testOut), inst);

  if (test instanceof LiteralValue) {
    if (test.data) return [null, c.handle(scope, node.consequent)[1]];
    else if (node.alternate) return [null, c.handle(scope, node.alternate)[1]];
    return [null, []];
  }

  const consequent: TValueInstructions<IValue | null> = !mergedJumps
    ? withAlwaysRuns(c.handle(scope, node.consequent), false)
    : [null, []];

  inst.push(...JumpInstruction.or(test, testOut), ...consequent[1]);

  if (!node.alternate) {
    inst.push(new AddressResolver(endIfAddr));
  } else {
    const endElseAddr = new LiteralValue(null);
    const needsJump = !endsWithControlFlow(consequent[1]) && !mergedJumps;

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

function createJumpOut(
  c: Compiler,
  scope: IScope,
  node: es.IfStatement,
  endIfAddr: IBindableValue<number | null>
) {
  const jumpNode = asMergeableJumpNode(node.consequent);
  if (!jumpNode) return new JumpOutValue(node, endIfAddr, false);
  const jump = c.handle(scope, jumpNode)[1][0] as JumpInstruction;
  return new JumpOutValue(node, jump.address, true);
}

function asMergeableJumpNode(
  body: es.Statement
): es.BreakStatement | es.ContinueStatement | undefined {
  if (body.type === "ContinueStatement" || body.type === "BreakStatement")
    return body;
  if (body.type !== "BlockStatement") return undefined;
  return asMergeableJumpNode(body.body[0]);
}
