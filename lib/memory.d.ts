/// <reference path="./kinds.d.ts" />

type MemoryCapacity = 64 | 512;
/**
 * A wrapper around memory cells/banks that is compatible with custom types.
 */
declare class Memory<S extends MemoryCapacity = 64> {
  constructor(cell: BasicBuilding, size?: S);

  [Symbol.iterator](): IterableIterator<number>;
  [index: number]: number;

  /**
   * The practical length of the memory view.
   */
  readonly length: S;
}
