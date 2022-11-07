import { es, IValue, TValueInstructions } from "../types";

export function appendSourceLocations<T extends IValue | null>(
  valueInst: TValueInstructions<T>,
  node: es.Node
): TValueInstructions<T> {
  for (const inst of valueInst[1]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    inst.source ??= node.loc!;
  }
  return valueInst;
}

export function withAlwaysRuns<T extends IValue | null>(
  valueInst: TValueInstructions<T>,
  value: boolean
) {
  valueInst[1].forEach(inst => (inst.alwaysRuns = value));
  return valueInst;
}
