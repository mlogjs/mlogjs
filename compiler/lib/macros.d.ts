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
declare class MutableArray<T> {
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

  /** Fills the array with a given value */
  fill(value: T): void;
  at(index: number): T;

  /** The number of items defined in this array */
  readonly size: number;

  [Symbol.iterator](): IterableIterator<T>;
}

declare class DynamicArray<T> extends MutableArray<T> {
  /** Pops the last item of the array */
  pop(): T;
  push(item: T): void;
  removeAt(index: number): T;

  get length(): number;
}

/**
 * A function that tells the compiler not to add
 * bound checking in the array accesses in the given expression.
 *
 * Only access that are computed inside the call are unchecked:
 *
 * ```js
 * // checked
 * const a = array[i]
 * // unckecked
 * const b = unchecked(array[i])
 *
 * // the array accesses inside `doSomething`
 * // are NOT unchecked
 * unchecked(doSomething(i))
 *
 * // only `array[i * 2]` is unchecked
 * const c = unchecked(doSomething(i) * array[i * 2])
 *
 * function doSomething(i) {
 *     // will always be checked
 *     return (array[i - 1] + array[i + 1]) / 2
 * }
 * ```
 */
declare function unchecked<T>(expression: T): T;
