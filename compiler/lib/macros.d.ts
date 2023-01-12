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
   * Creates an array with fixed size that supports dynamic index accesses.
   *
   * The array can contain any value assignable to a store.
   */
  constructor(init: readonly T[]);
  constructor(length: number);

  [index: number]: T;

  /** Fills the array with a given value */
  fill(value: T): void;

  /**
   * Returns the item at the given index. Negative indexes are relative to `this.size`.
   *
   * ```js
   * print(array.at(-1)); // equal to array[array.size - 1]
   * ```
   */
  at(index: number): T;

  /** The number of items preallocated for this array */
  readonly size: number;

  [Symbol.iterator](): IterableIterator<T>;
}

declare class DynamicArray<T> extends MutableArray<T> {
  /**
   * Creates an array with a predefined capacity that supports dynamic index accesses.
   *
   * The array can contain any value assignable to a store.
   */
  constructor(init: readonly T[]);
  constructor(length: number);

  /**
   * Sets the last item of the array to `undefined` and decreases its length by 1.
   *
   * This method only generates the instructions for getting the value when needed.
   *
   * You can use `unchecked` to skip the bound check.
   *
   * ```js
   * array.pop(); // doesn't generate getter instructions
   * print(array.pop()); // generates getter instructions
   * unchecked(array.pop()); // doesn't check the array length
   * ```
   */
  pop(): T;
  /**
   * Adds the given item to the end of the array.
   *
   * If the array is full, the proccess is skipped.
   *
   * You can use `unchecked` to skip the length check.
   *
   * ```js
   * // only do this if you know the array isn't full
   * unchecked(array.push(Items.copper));
   *
   * array.push(Items.beryllium);
   * ```
   */
  push(item: T): void;

  /**
   * Removes the item at the given index.
   *
   * This method only generates the instructions for getting the value when needed.
   *
   * The index must be within the range: [`0`, `this.length - 1`]
   *
   * You can use `unchecked` to skip the bound check.
   *
   * ```js
   *
   * let a = array.removeAt(i); // generates getter instructions
   * array.removeAt(i); // doesn't generate getter instructions
   *
   * // only do this if you know the index is valid
   * unchecked(array.removeAt(i));
   * ```
   */
  removeAt(index: number): T;

  /**
   * Returns the item at the given index. Negative indexes are relative to `this.length`.
   *
   * ```js
   * print(array.at(-1)); // equal to array[array.length - 1]
   * ```
   */
  at(index: number): T;

  /** The current length of the array, it can't be directly modified by the user. */
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
