/**
 * Identifier for global variables that can be modified at any point of
 * execution.
 */
export class GlobalId {
  type = "global" as const;

  constructor(public number: number) {}

  equals(other: GlobalId) {
    return this.number === other.number;
  }

  toString() {
    return `@${this.number}`;
  }
}

/** Identifier for immutable variables or constants. */
export class ImmutableId {
  type = "immutable" as const;
  constructor(public number: number) {}

  equals(other: ImmutableId) {
    return this.number === other.number;
  }

  toString() {
    return `%${this.number}`;
  }
}

export type ValueId = GlobalId | ImmutableId;

export function isImmutableId(value: unknown): value is ImmutableId {
  return value instanceof ImmutableId;
}
