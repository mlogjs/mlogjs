import { AddressResolver, JumpInstruction } from "../instructions";
import { es, IInstruction, IValue, TValueInstructions } from "../types";

export function appendSourceLocations<T extends IValue | null>(
  valueInst: TValueInstructions<T>,
  node: es.Node,
): TValueInstructions<T> {
  for (const inst of valueInst[1]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    inst.source ??= node.loc!;
  }
  return valueInst;
}

export function withAlwaysRuns<T extends IValue | null>(
  valueInst: TValueInstructions<T>,
  value: boolean,
) {
  valueInst[1].forEach(inst => (inst.alwaysRuns = value));
  return valueInst;
}

/** Removes jump instructions that point right to the next line */
export function hideRedundantJumps(inst: IInstruction[]) {
  for (let i = inst.length - 1; i >= 0; i--) {
    const instruction = inst[i];
    if (!(instruction instanceof JumpInstruction)) continue;

    const { address } = instruction;

    let searchIndex = i + 1;
    let current = inst[searchIndex];

    while (current?.hidden) {
      if (
        current instanceof AddressResolver &&
        current.bonds.includes(address)
      ) {
        // only gets assigned if `current` is an adress resolver
        // that resolves the jump adress
        // and that is also right next to the jump,
        // without any actual instructions in between
        instruction.hidden = true;
        break;
      }
      searchIndex++;
      current = inst[searchIndex];
    }
  }
}

/** A helper that appends the instructions from `value` into `inst` and returns it's `IValue` instance */
export function pipeInsts<T extends IValue | null>(
  value: TValueInstructions<T>,
  inst: IInstruction[],
): T {
  inst.push(...value[1]);
  return value[0];
}

export function usesAddressResolver(
  resolver: AddressResolver,
  instructions: IInstruction[],
) {
  for (let i = 0; i < instructions.length; i++) {
    const inst = instructions[i];
    if (
      inst instanceof JumpInstruction &&
      resolver.bonds.includes(inst.address)
    )
      return true;
  }
  return false;
}

export function formatInstructionArgs(
  args: (IValue | string | null)[],
): string[] {
  return args
    .filter((value): value is IValue | string => !!value)
    .map(value => (typeof value === "string" ? value : value.toMlogString()));
}
