/**
 * Identifier for global variables that can be modified at any point of
 * execution.
 */
export class GlobalId {
  type = "global" as const;
}

/** Identifier for immutable variables or constants. */
export class ImmutableId {
  type = "immutable" as const;
}

export type ValueId = GlobalId | ImmutableId;
