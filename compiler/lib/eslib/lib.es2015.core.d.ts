/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>

/** Does not exist. It's only here because typescript needs it */
interface RegExp {}

interface Math {
  /**
   * Returns the sign of the x, indicating whether x is positive, negative or zero.
   * @param x The numeric expression to test
   */
  sign(x: number): number;

  /**
   * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
   * subtracting 1 from the exponential function of x (e raised to the power of x, where e
   * is the base of the natural logarithms).
   * @param x A numeric expression.
   */
  expm1(x: number): number;

  /**
   * Returns the hyperbolic cosine of a number.
   * @param x A numeric expression that contains an angle measured in degrees.
   */
  cosh(x: number): number;

  /**
   * Returns the hyperbolic sine of a number.
   * @param x A numeric expression that contains an angle measured in degrees.
   */
  sinh(x: number): number;

  /**
   * Returns the hyperbolic tangent of a number.
   * @param x A numeric expression that contains an angle measured in degrees.
   */
  tanh(x: number): number;

  /**
   * Returns the inverse hyperbolic cosine of a number.
   * @param x A numeric expression that contains an angle measured in degrees.
   */
  acosh(x: number): number;

  /**
   * Returns the inverse hyperbolic sine of a number.
   * @param x A numeric expression that contains an angle measured in degrees.
   */
  asinh(x: number): number;

  /**
   * Returns the inverse hyperbolic tangent of a number.
   * @param x A numeric expression that contains an angle measured in degrees.
   */
  atanh(x: number): number;

  /**
   * Returns the integral part of the a numeric expression, x, removing any fractional digits.
   * If x is already an integer, the result is x.
   * @param x A numeric expression.
   */
  trunc(x: number): number;
}
