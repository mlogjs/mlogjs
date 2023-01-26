/// <reference no-default-lib="true"/>

interface Symbol {}

interface SymbolConstructor {}

declare var Symbol: SymbolConstructor;
interface Object {}

/**
 * Creates a new function.
 */
interface Function {}

/**
 * Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter.
 */
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown;

/**
 * Removes the 'this' parameter from a function type.
 */
type OmitThisParameter<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T;

interface CallableFunction extends Function {}

interface NewableFunction extends Function {}

interface IArguments {}

interface String {
  /** Returns the length of a String object. */
  readonly length: number;
}

interface Boolean {}

interface Number {}

interface TemplateStringsArray extends ReadonlyArray<string> {
  readonly raw: readonly string[];
}

/**
 * The type of `import.meta`.
 *
 * If you need to declare that a given property exists on `import.meta`,
 * this type may be augmented via interface merging.
 */
interface ImportMeta {}

interface Math {
  /** Pi. This is the ratio of the circumference of a circle to its diameter. */
  readonly PI: number;

  /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
  readonly E: number;
  /**
   * Use this value to convert degrees to radians.
   *
   *  ```js
   *  let radians = degrees * Math.degToRad;
   *  ```
   */
  readonly degToRad: number;

  /**
   * Use this value to convert radians to degrees.
   *
   *  ```js
   *  let degrees = radians * Math.radToDeg;
   *  ```
   */
  readonly radToDeg: number;

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

  /** Returns the sine of an angle in degrees.*/
  sin(x: number): number;

  /** Returns the cosine of an angle in degrees */
  cos(x: number): number;

  /** Returns the tangent of an angle in degrees */
  tan(x: number): number;

  /**Returns the greatest integer less than or equal to `x` */
  floor(x: number): number;

  /**Returns the smallest integer greater than or equal to `x` */
  ceil(x: number): number;

  /** Returns the positive square root of a number */
  sqrt(x: number): number;

  /**
   * Returns a random floating point number from 0 to `range` (excluding `range` itself)
   * @param range
   */
  rand(range: number): number;

  /** Returns the arc sine of a number, in degrees */
  asin(x: number): number;

  /** Returns the arc cosine of a number, in degrees */
  acos(x: number): number;

  /** Returns the arc tangent of a number, in degrees */
  atan(x: number): number;

  /**
   * Returns the integer result of the division: `x / y`.
   *
   * @param x
   * @param y
   */
  idiv(x: number, y: number): number;

  /**
   * Returns the value of a base expression taken to a specified power.
   *
   * @param x The base value of the expression.
   * @param y The exponent value of the expression.
   */
  pow(x: number, y: number): number;
}
declare const Math: Math;

interface Error {}

interface EvalError extends Error {}

interface RangeError extends Error {}

interface ReferenceError extends Error {}

interface SyntaxError extends Error {}

interface TypeError extends Error {}

interface URIError extends Error {}

/////////////////////////////
/// ECMAScript Array API (specially handled by compiler)
/////////////////////////////

interface ReadonlyArray<T> {
  /**
   * Gets the length of the array. This is a number one higher than the highest element defined in an array.
   */
  readonly length: number;

  readonly [n: number]: T;
}

interface ConcatArray<T> {
  readonly length: number;
  readonly [n: number]: T;
}

interface Array<T> {
  /**
   * Gets or sets the length of the array. This is a number one higher than the highest index in the array.
   */
  length: number;

  [n: number]: T;
}

interface ArrayLike<T> {
  readonly length: number;
  readonly [n: number]: T;
}

/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Make all properties in T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends new (...args: any) => any> =
  T extends new (...args: infer P) => any ? P : never;

/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

/**
 * Obtain the return type of a constructor function type
 */
type InstanceType<T extends new (...args: any) => any> = T extends new (
  ...args: any
) => infer R
  ? R
  : any;

/**
 * Convert string literal type to uppercase
 */
type Uppercase<S extends string> = intrinsic;

/**
 * Convert string literal type to lowercase
 */
type Lowercase<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to uppercase
 */
type Capitalize<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to lowercase
 */
type Uncapitalize<S extends string> = intrinsic;

/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> {}

/////////////////////////////
/// ECMAScript Internationalization API
/////////////////////////////

interface String {}

interface Number {}
