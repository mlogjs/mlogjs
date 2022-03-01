/// <reference path="./kinds.d.ts" />

type MemoryCapacity = 64 | 512;
/**
 * A wrapper around memory cells/banks that is compatible with custom types.
 */
declare class Memory<
  T = number,
  S extends MemoryCapacity = 64,
  L extends number = number
> {
  /** The size of the memory cell/bank */
  readonly size: S;
  constructor(cell: BasicBuilding, size?: S);

  /** Returns a raw view of the underying data
   *
   * @example
   *  // The order of the fields matters when
   *  // the memory layout is built
   *  interface Point {
   *    x: number;
   *    y: number;
   *  }
   *  const cell = new Memory<Point>(getBuilding("cell1"));
   *  cell[0].x = 10;
   *  cell[0].y = 50;
   *
   *  // get raw memory view
   *  const rawCell = cell.raw();
   *  print(rawCell[0]); // 10
   *  print(rawCell[1]); // 50
   */
  raw(): RawMemory<S>;
  [Symbol.iterator](): IterableIterator<T>;
  [index: number]: T;

  /**
   * The practical length of the memory view, for numbers and
   * booleans it has the same value as `size`. For custom types it is
   * the `size` of the cell divided by the total size required by the type.
   */
  readonly length: L;
}

declare class RawMemory<S extends MemoryCapacity = 64> extends Memory<
  number,
  S,
  S
> {
  constructor(memory: Memory);
}
