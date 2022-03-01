/// <reference no-default-lib="true" />

interface Array<T> {
  [index: number]: T;
  length: number;
  [Symbol.iterator](): IterableIterator<T>;
}

interface Boolean {}

interface Function {
  readonly name: string;
}

interface IArguments {}

interface Number {}

interface Object {}

interface RegExp {}

interface String {}

interface Math {
  /**
   * Returns the larger of two of supplied numeric expressions.
   * @param a
   * @param b
   */
  max(a: number, b: number): number;

  /**
   * Returns the smaller of two of supplied numeric expressions.
   * @param a
   * @param b
   */
  min(a: number, b: number): number;

  /**
   * Returns the angle of a vector in degrees
   * @param a
   * @param b
   */
  angle(a: number, b: number): number;

  /**
   * Returns the length of a vector
   * @param a
   * @param b
   */
  len(a: number, b: number): number;

  /**
   * Returns 2D simplex noise
   * @param x
   * @param y
   */
  noise(x: number, y: number): number;

  /**
   * Returns the absolute value of a number.
   * @example
   *    Math.abs(-5) // 5
   *    Math.abs(5) // 5
   * @param x
   */
  abs(x: number): number;

  /**
   * Returns the natural logarithm (base e) of a number
   * @param x
   */
  log(x: number): number;

  /**
   * Returns the logarithm (base 10) of a number
   * @param x
   */
  log10(x: number): number;

  sin(x: number): number;
  cos(x: number): number;
  tan(x: number): number;
  floor(x: number): number;
  ceil(x: number): number;
  sqrt(x: number): number;

  /**
   * Returns a random floating point number from 0 to `range` (excluding `range` istself)
   * @param range
   */
  rand(range: number): number;
}
declare const Math: Math;