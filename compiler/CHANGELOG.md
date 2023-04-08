# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added the `setProp` command (`setprop` instruction).

### Changed

- Logical operators are now able to short-circuit.
- Synchronized the block symbol table with the game's.
- Store values are now senseable.

### Fixed

- Fixed the `??` operator generating more temporary values than necessary.

## [0.5.2] - 2023-03-05

### Deprecated

- Deprecated the `unitControl.pathfind` command, as it is not available in the latest game version.

## [0.5.1] - 2023-03-05

### Changed

- The `fill` method of dynamic arrays is no longer inlined.
- The temporary getter and setter values of dynamic arrays have been renamed to be more readable.

### Fixed

- Fixed the `concat` function having inconsistent behavior.
- Fixed the unary plus operator not converting values to numbers.
- Fixed using the `??=` operator on a dynamic array entry computing the value twice.
- Fixed unecessary temp values being created when writing to dynamic arrays.
- Fixed empty if statement blocks throwing an error.
- Fixed handling of truthy values in `do` `while` loop conditions.

## [0.5.0] - 2023-03-04

### Added

- Added support for custom online editor settings.
- Added support for a "goto" action for jump instructions in the online editor (<kbd>ctrl</kbd> + <kbd>click</kbd>).
- Added support for multi-file editing to the online editor.
- Added support for `concat` calls with tagged template literals.
- Added support for the typescript `satisfies` keyword.
- Added support for default destructuring values.
- Added support for the `draw.col` command overload.
- Added support for the `unitControl.unbind` command overload.
- Added the `Math.asin`, `Math.acos` and `Math.atan` methods.
- Added the `Math.idiv` method to perform integer division.
- Added the `Math.pow` method (the `**` operator is still available).
- Added support for compression of the `op` + `jump` instructions.
- Added optimizations to `if/else` statements that act as guard clauses.
- Added optimizations to the compiler to only add the `end` instruction when necessary.
- Added the `setup` subcommand to the CLI.
- Added the `DynamicArray` macro to support arrays with variable size (and with a fixed size limit).
- Added the `MutableArray` macro to support dynamically indexed arrays.

### Changed

- `Memory` macros can now be created with a dynamic `length` value.
- (Breaking) `undefined` replaced `null` as the nullish value in the compiler.
- `unitBind` now also accepts an unit object as a parameter.
- Error messages now include information about the type of the variables.
- `unitControl.getBlock` now also returns the floor of the tile.
- (Breaking) `control.color` now gets RGBA data as an input instead of individual RGB values.
- Changed the equality of stores. They are now treated as equal if they have the same runtime name.

### Fixed

- Fixed cached operations propagating across the cases of a `switch`.
- Fixed the `??` operator using normal inequality instead of strict inequality.
- Fixed the type of `Vars.unit.boosting` being `number` instead of `boolean`.
- Fixed the order of operations in destructuring assignments.
- Fixed typo on `Teams.derelict` (was `Teams.delerict`).
- Fixed the internal implementations of `Math.sin`, `Math.cos` and `Math.tan`.
- Fixed logical expressions creating unnecessary temp values.
- Fixed optional chaning not working on null literals (`null?.foo`).
- Fixed break statements not working inside `do while` statements.
- Fixed functions returning values from previous calls.
- Fixed doc examples for the `fetch` command.
- Fixed the hiding of redundant `jump` instructions.

## [0.4.10] - 2022-11-17

### Added

- Added operation caching for arithmethic operators and Math functions.

### FIxed

- Fixed empty `if` statements having their jumps unduly removed.

## [0.4.9] - 2022-11-10

### Added

- Added support for empty statements.
- Added support for optional chaining (`obj?.foo`).
- Added support for the comma operator (`let foo = (a, b, c)`)

### Fixed

- Fixed the implementation of the `!==` operator.

## [0.4.8] - 2022-11-09

### Fixed

- Fixed the implementation of `switch` statement optimizations.

## [0.4.7] - 2022-11-08

### Changed

- Changed the internal model used to handle temporary values.
- Literal constants can now make logical expressions short circuit at compile time.

### Fixed

- Fixed chained ternary operators having unecessary temporary values.
- Fixed the implementation of inlined return statements.

## [0.4.6] - 2022-10-31

### Fixed

- Fixed function return values being overridden when called multiple times inside expressions.

## [0.4.5] - 2022-10-31

### Changed

- Restored the type declarations for the `config` member in blocks.
- Patched `control.color` to still work after v7, retaning its syntax.

  ```js
  // current syntax
  control.color(building, r, g, b);

  // what would be the new syntax if the patch wasn't made
  control.color(building, packColor(r, g, b, a));
  ```

### Fixed

- Fixed functions not always returning from their bodies.

## [0.4.4] - 2022-10-30

### Added

- Added support to sense the new items and liquids from mindustry v7 on blocks.

### Fixed

- Fixed the implementation of the `continue` statement in `for` loops.

## [0.4.3] - 2022-10-29

### Added

- Added an example containing a function to calculate a term of the fibonacci sequence.

### Changed

- Synchronized the repository and the compiler's READMEs

### Fixed

- Fixed the docs for `draw.image`

## [0.4.2] - 2022-10-24

### Added

- Added an example that computes pascal's triangle.
- Added support for javascript labels.
- Added support for function hoisting.

### Changed

- Docs are now built using vitepress.

### Fixed

- Fixed the implementation of the `??=` operator.
- Self assignments are now removed from the final output (`set a a`).

## [0.4.1] - 2022-10-15

### Addded

- Added testable examples for the compiler.
- Added support for multiline `asm` calls.

### Fixed

- Fixed incorrect mapping between scopes and temporary values.

## [0.4.0] - 2022-09-25

### Added

- Added support for the Mindustry v7 instructions.
- Added support for the Mindustry v7 items, blocks and liquids.
- Added support for tagged template expressions (`` foo`string ${a}` ``)
- Added default parameters for `printFlush` (message1) and `drawFlush` (display1)
- Added support for the nullish coalescing operator (`a ?? b`).
- Added support for the `switch` statement.
- Added support for bidirectional sourcemapping to the online editor.
- Added mlog highlighting to the online editor.

### Changed

- (Breaking) Some commands now take named parameters instead of positional parameters.
- (Breaking) Mlog code is now inlined by calling the `asm` function instead of just using template strings.

  ```js
  let a;
  // before
  `set ${a} 1`;

  // after
  asm`set ${a} 1`;
  ```

- Changed the online editor theme to dark.
- The online editor now compiles code inside a service worker.

### Fixed

- Fixed inlined return statements not generating jump instructions.
- Fixed inlined functions having incorrect return values.

## [0.3.0] - 2022-06-01

### Added

- Added documentation for `Vars.tick` and `Vars.time`.

### Changed

- Using the `typeof` operator on a senseable value now returns `"store"` again.
- Values returned by `getVar` are no longer assumed to be constant.

### Fixed

- Fixed the name of temporary values inside functions.

## [0.3.0-beta.0] - 2022-05-25

### Added

- Added support for `@tick` (`Vars.tick`) and `@time` (`Vars.time`).
- Added docs for the supported javascript syntax.
- Added docs for the supported typescript syntax.
- Added support for object and array destructuring assignments.
- Added support for nested destructuring patterns.
- Added the `endScript` function.
- Added support for the ternary operator.
- Added support for typescript's type casts.
- Added support for typescript's enums.
- Added support for typescript's non null assertions.
- Added support for typescript's type and interface declarations.
- Added support for `do while` loops.
- Added jsdoc comments to built-in functions.

### Changed

- Babel is now used to parse code instead of acorn.
- Variable names generated with `--compact-names=false` now follow the pattern `[name]:[line]:[column]`
- The online editor's output line counter now starts at zero.
- (breaking) The building and unit macros have been replaced by senseable values.

### Removed

- The building and unit macros have been removed.

### Fixed

- Fixed the `bin` field in the compiler's `package.json`.
- Fixed the `do while` loop output when it had a constant condition.
- Fixed handling of arrow functions.
- Fixed destructuring assignments with dynamic keys.
- Fixed destructuring assignments with memory entries on the left side.

  ```js
  // now works
  const mem = new Memory(getBuilding("cell1"));
  ({ a: mem[0] } = { a: 1 });
  ```

- Fixed jsdoc examples in the type definitions being broken in the online editor.
- Fixed the location of errors thrown inside object literals and destructuring patterns.
- Fixed the output of the `sensor` command.

## [0.2.2] - 2022-03-12

### Fixed

- Fixed the generated code for the `print` command.
- Fixed assignments to memory entries not returning a value.
- Fixed the compile time evaluation of calls to `Math.angle`.

## [0.2.1] - 2022-03-06

### Added

- Created an online editor.

### Changed

- Parsing is now made with acorn instead of esprima.

## [0.2.0] - 2022-03-05

### Added

- Added first class support for all the available instructions and variables.
- Added support for shallow array destructuring.

### Changed

- Reading and writing to memory cells is now done via the `Memory` macro.
- Methods have been moved out of the block macros, each into a built-in function.

### Removed

- Removed the `Store` and `Temp` factories.

### Fixed

- Fixed the unary operators `!` and `~` not working.

## [0.1.11] - 2021-06-20

### Changed

- Block macros are now serialized to their names.

## [0.1.10] - 2021-06-14

### Added

- Added support for arrays.

## [0.1.9] - 2021-06-13

### Added

- Added the `Entity` factory, which works as an alias for `Block`.
- Added more type definitions.

## [0.1.8] - 2021-05-26

### Added

- Added a breakout game example.

### Changed

- The library type definitions have been moved from `mlogcc.d.ts` to `mlogjs.d.ts`.

## [0.1.7] - 2021-05-23

### Added

- Added the `concat` function to contatenate constant strings.
- Added a `.length` field to constant strings.

## [0.1.6] - 2021-05-19

## [0.1.5] - 2021-05-16

### Changed

- The optimization for temp values was reintroduced.

## [0.1.4] - 2021-05-16

### Changed

- Removed the optimization for temp values.

## [0.1.3] - 2021-05-16

## [0.1.2] - 2021-05-16

### Added

- Added custom support for the `typeof` operator.

### Changed

- Renamed the project to `mlogjs`.

### Fixed

- Fixed `sensor` not automatically adding `"@"` before the name.

## [0.1.1] - 2021-05-15

- First version.

[unreleased]: https://github.com/mlogjs/mlogjs/compare/v0.5.2...HEAD
[0.5.2]: https://github.com/mlogjs/mlogjs/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/mlogjs/mlogjs/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/mlogjs/mlogjs/compare/v0.4.10...v0.5.0
[0.4.10]: https://github.com/mlogjs/mlogjs/compare/v0.4.9...v0.4.10
[0.4.9]: https://github.com/mlogjs/mlogjs/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/mlogjs/mlogjs/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/mlogjs/mlogjs/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/mlogjs/mlogjs/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/mlogjs/mlogjs/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/mlogjs/mlogjs/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/mlogjs/mlogjs/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/mlogjs/mlogjs/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/mlogjs/mlogjs/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/mlogjs/mlogjs/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/mlogjs/mlogjs/compare/v0.3.0-beta.0...v0.3.0
[0.3.0-beta.0]: https://github.com/mlogjs/mlogjs/compare/v0.2.0...v0.3.0-beta.0
[0.2.2]: https://github.com/mlogjs/mlogjs/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/mlogjs/mlogjs/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/mlogjs/mlogjs/compare/v0.3.0...v0.2.0
[0.1.11]: https://github.com/mlogjs/mlogjs/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/mlogjs/mlogjs/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/mlogjs/mlogjs/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/mlogjs/mlogjs/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/mlogjs/mlogjs/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/mlogjs/mlogjs/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/mlogjs/mlogjs/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/mlogjs/mlogjs/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/mlogjs/mlogjs/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/mlogjs/mlogjs/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/mlogjs/mlogjs/compare/a2959d9ce11410fd99af66667047a52f5330f651...v0.1.1
