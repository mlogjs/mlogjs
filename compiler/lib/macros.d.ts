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
declare class DynamicArray<T> {
  /**
   * Creates a dynamic acess array, it can contain any type assignable to a store.
   */
  constructor(init: readonly T[]);

  /**
   * Creates a dynamic acess array, it can contain any type assignable to a store.
   */
  constructor(length: number);

  /** Checked index access. */
  [index: number]: T;

  /** Unchecked index acess, only do this if  */
  get(index: number): T;

  /** Sets the value at the given index */
  set(index: number, value: T): T;

  /** Fills the array with a given value */
  fill(value: T): void;

  readonly length: number;

  [Symbol.iterator](): IterableIterator<T>;
}
