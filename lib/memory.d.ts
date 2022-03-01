/// <reference path="./kinds.d.ts" />

type MemoryCapacity = 64 | 512;
/**
 * A wrapper around memory cells/banks that is compatible with custom types.
 */
declare class Memory<S extends MemoryCapacity = 64> {
  /** The size of the memory cell/bank */
  readonly size: S;
  constructor(cell: BasicBuilding, size?: S);

  [Symbol.iterator](): IterableIterator<number>;
  [index: number]: number;

  /**
   * The practical length of the memory view, for numbers and
   * booleans it has the same value as `size`. For custom types it is
   * the `size` of the cell divided by the total size required by the type.
   */
  readonly length: S;
}

declare class RawMemory<S extends MemoryCapacity = 64> extends Memory<
  number,
  S,
  S
> {
  constructor(memory: Memory);
}
