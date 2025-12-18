import { InstructionNode } from "./block";
import { TBlockInstruction } from "./instructions";

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
    return `GlobalId(${this.number})`;
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
    return `ImmutableId(${this.number})`;
  }
}

export type ValueId = GlobalId | ImmutableId;
