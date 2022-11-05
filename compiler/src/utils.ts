import { es, IValue, TEOutput, TValueInstructions } from "./types";
import {
  DestructuringValue,
  IObjectValueData,
  LiteralValue,
  ObjectValue,
} from "./values";

/**
 * The prefix for internal variables inside the compiler output
 */
export const internalPrefix = "&";
export const discardedName = `${internalPrefix}_`;

/**
 * Returns a string that has the format: [line]:[column].
 *
 * If `name` is provided, and it is a string, the resulting string will
 * have the format: [name]:[line]:[column].
 */
export function nodeName(node: es.Node, name?: false | string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { line, column } = node.loc!.start;
  if (typeof name === "string") return `${name}:${line}:${column}`;
  return `${line}:${column}`;
}

/**
 * Converts a camel case string into a dash case one.
 *
 * As an example `camelCase` becomes `camel-case`
 * @example
 * ```
 * camelToDashCase("camelCase") // returns "camel-case"
 * ```
 */
export function camelToDashCase(name: string) {
  return name.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
}

export const itemNames = [
  "copper",
  "lead",
  "metaglass",
  "graphite",
  "sand",
  "coal",
  "titanium",
  "thorium",
  "scrap",
  "silicon",
  "plastanium",
  "phaseFabric",
  "surgeAlloy",
  "sporePod",
  "blastCompound",
  "pyratite",
  "beryllium",
  "tungsten",
  "oxide",
  "carbide",
  "fissileMatter",
  "dormantCyst",
];

/**
 * A more type safe version of `Object.assign`
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function assign<T extends {}>(
  obj: T,
  props: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T as T[K] extends Function ? never : K]?: T[K];
  }
): T {
  return Object.assign(obj, props);
}

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

export function isTemplateObjectArray(value: IValue): value is ObjectValue & {
  data: IObjectValueData & {
    raw: ObjectValue & {
      data: IObjectValueData & {
        length: LiteralValue<number>;
      };
    };
    length: LiteralValue<number>;
  };
} {
  return (
    value instanceof ObjectValue &&
    value.data.length instanceof LiteralValue &&
    value.data.length.isNumber() &&
    value.data.raw instanceof ObjectValue &&
    value.data.raw.data.length instanceof LiteralValue &&
    value.data.raw.data.length.isNumber()
  );
}

export function extractOutName(out: TEOutput | undefined) {
  if (!out || typeof out === "string") return out;
  return out.name;
}

export function extractDestrucuringOut(
  out: TEOutput | undefined,
  field: string | number
) {
  if (out === discardedName) return out;
  if (!(out instanceof DestructuringValue)) return;
  return out.fields[field] ?? discardedName;
}
