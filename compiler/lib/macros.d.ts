/// <reference path="./kinds.d.ts" />

type MemoryCapacity = 64 | 128 | 512;
/**
 * Allows you to view and modify the data of memory cells and memory banks.
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

/**
 * Creates a mutable, dynamic access array, the length is constant.
 *
 * The instructions for dynamic accesses
 */
declare class DynamicArray<T extends readonly []> {
  constructor(init: T);

  constructor(length: number);

  [index: number]: T[number];

  readonly length: number;
}
