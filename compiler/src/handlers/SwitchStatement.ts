import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import {
  EInstIntent,
  EMutability,
  es,
  IInstruction,
  IScope,
  THandler,
} from "../types";
import { lazy, usesAddressResolver, withAlwaysRuns } from "../utils";
import { LiteralValue } from "../values";

export const SwitchStatement: THandler<null> = (
  c,
  scope,
  node: es.SwitchStatement,
) => {
  const innerScope = scope.createScope();

  const [ref, refInst] = c.handleEval(scope, node.discriminant);

  const inst: IInstruction[] = [];

  const endAdress = new LiteralValue(null);
  const endLine = new AddressResolver(endAdress).bindBreak(innerScope);

  const caseJumps: IInstruction[] = [];
  let defaultJump: JumpInstruction | undefined;

  // if there is a case that is guaranteed to run
  let constantCase = false;
  let onlyConstantTests = true;

  for (const scase of node.cases) {
    const bodyInst = lazy(
      () => c.handleMany(createCaseScope(innerScope), scase.consequent)[1],
    );
    const bodyAdress = new LiteralValue(null);
    const bodyLine = new AddressResolver(bodyAdress);

    const canFallInto = !endsWithoutFalltrough(inst);
    let includeJump = !constantCase;
    const includeBody = !constantCase || canFallInto;

    if (!scase.test) {
      if (includeJump) {
        [defaultJump] = c.handle(innerScope, scase, () => [
          null,
          [new JumpInstruction(bodyAdress, EJumpKind.Always)],
        ])[1] as JumpInstruction[];
      }
      if (includeBody) inst.push(bodyLine, ...bodyInst());
      continue;
    }

    const [test, testInst] = c.handleEval(innerScope, scase.test);
    if (onlyConstantTests)
      onlyConstantTests = test.mutability === EMutability.constant;

    let jump: IInstruction[];
    // check if it can be evaluated at compile time
    // the scope copy prevents unecessary increases in the temp counter
    const [comp] = ref["=="](innerScope.copy(), test);

    if (comp instanceof LiteralValue) {
      // whether other cases can falltrough and reach this one
      const noFallInto = !canFallInto;
      const isLastCase = scase === node.cases[node.cases.length - 1];
      if (!comp.data) {
        // this case is not accessible in any way
        if (noFallInto) continue;
        includeJump = false;
      } else {
        // this case is only accessible via the comparison jump
        // and all the other cases will never run
        if (
          noFallInto &&
          onlyConstantTests &&
          (isLastCase || endsWithoutFalltrough(bodyInst()))
        ) {
          return [null, [...bodyInst(), endLine]];
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
    if (includeBody) inst.push(bodyLine, ...bodyInst());
  }

  // ensures that the processor exits
  // the switch if no cases match
  defaultJump ??= new JumpInstruction(endAdress, EJumpKind.Always);

  if (caseJumps.length > 0) {
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
      ...(usesEndLine(endLine, inst, defaultJump) ? [endLine] : []),
    ],
  ];
};

function endsWithoutFalltrough(inst: IInstruction[]) {
  if (inst.length === 0) return true;
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

    return instruction.intent !== EInstIntent.none;
  }
  return false;
}

function usesEndLine(
  endLine: AddressResolver,
  inst: IInstruction[],
  defaultJump: JumpInstruction,
) {
  if (endLine.bonds.includes(defaultJump.address)) return true;
  return usesAddressResolver(endLine, inst);
}

function createCaseScope(scope: IScope) {
  // prevents the operation cache from propagating
  // but also allows the case to declare variables
  // that can be used by other cases
  const child = scope.createScope();
  child.data = scope.data;
  return child;
}
