import {
  AddressResolver,
  BreakInstruction,
  EJumpKind,
  JumpInstruction,
} from "../instructions";
import { es, IInstruction, THandler } from "../types";
import { withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";

export const SwitchStatement: THandler<null> = (
  c,
  scope,
  node: es.SwitchStatement
) => {
  const innerScope = scope.createScope();

  const [ref, refInst] = c.handleEval(scope, node.discriminant);

  const inst: IInstruction[] = [];

  const endAdress = new LiteralValue(null);
  const endLine = new AddressResolver(endAdress).bindBreak(innerScope);

  const caseJumps: IInstruction[] = [];
  let defaultJump: IInstruction | undefined;

  // if there is a case that is guaranteed to run
  let constantCase = false;

  for (const scase of node.cases) {
    const [, bodyInst] = c.handleMany(innerScope, scase.consequent);
    const bodyAdress = new LiteralValue(null);
    const bodyLine = new AddressResolver(bodyAdress);

    if (!scase.test) {
      [defaultJump] = c.handle(innerScope, scase, () => [
        null,
        [new JumpInstruction(bodyAdress, EJumpKind.Always)],
      ])[1];
      inst.push(bodyLine, ...bodyInst);
      continue;
    }

    const [test, testInst] = c.handleEval(innerScope, scase.test);

    const callFallInto = !endsWithBreak(inst);

    let includeJump = !constantCase;
    const includeBody = !constantCase || callFallInto;

    let jump: IInstruction[];
    // check if it can be evaluated at compile time
    // the scope copy prevents unecessary increases in the temp counter
    const [comp] = ref["=="](innerScope.copy(), test);

    // if the constant expression resolves to false
    // the whole case gets omitted
    // otherwise it returns the instructions for
    // the body of this case
    if (comp instanceof LiteralValue) {
      // whether other cases can falltrough and reach this one
      const noFallInto = inst.length === 0 || !callFallInto;

      if (!comp.data) {
        if (noFallInto) continue;
        includeJump = false;
      } else {
        if (noFallInto) {
          if (endsWithBreak(bodyInst)) return [null, [...bodyInst, endLine]];
          // clear the previous case tests and bodies
          inst.splice(0, inst.length);
          caseJumps.splice(0, caseJumps.length);
        }

        jump = c.handle(innerScope, scase, () => [
          null,
          [new JumpInstruction(bodyAdress, EJumpKind.Always)],
        ])[1];
        constantCase = true;
      }
    }
    // makes sourcemapping for the jump more specific
    jump ??= c.handle(innerScope, scase, () => [
      null,
      [new JumpInstruction(bodyAdress, EJumpKind.StrictEqual, ref, test)],
    ])[1];

    if (includeJump) caseJumps.push(...testInst, ...jump);
    if (includeBody) inst.push(bodyLine, ...bodyInst);
  }

  // ensures that the processor exits
  // the switch if no cases match
  defaultJump ??= new JumpInstruction(endAdress, EJumpKind.Always);

  if (caseJumps.length > 0) {
    withAlwaysRuns([null, inst], false);
    withAlwaysRuns([null, [...caseJumps.slice(1), defaultJump]], false);
    withAlwaysRuns([null, inst], false);
  }

  return [
    null,
    [
      ...refInst,
      ...caseJumps,
      ...(caseJumps.length > 0 && !constantCase ? [defaultJump] : []),
      ...inst,
      endLine,
    ],
  ];
};

function endsWithBreak(inst: IInstruction[]) {
  for (let i = inst.length - 1; i >= 0; i--) {
    const instruction = inst[i];

    // this means that there is an instruction trying to reference
    // the final function `set @counter` instruction
    // of course this generates an unecessary
    // `set @counter` in cases where a control flow
    // structure contains a fallback return statement
    // TODO: fix this with static analysis
    if (instruction instanceof AddressResolver) return false;
    if (instruction.hidden) continue;
    return instruction instanceof BreakInstruction;
  }
  return false;
}
