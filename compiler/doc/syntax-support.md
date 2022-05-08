# Supported javascript/typescript syntax

Since there drastic differences bewteen the browser environment and
the mlog runtime on mindustry, not all of the existent javascript
features are supported. Bellow are lists containing the most significant supported and
unsupported features, along with some that could be supported in the future.

## Relevant supported features

- Variable declarations with `let`, `const` and `var`
- Functions
- Arrow Functions
- Scoped variables
- `if` statements
- `else` statements
- `null` keyword
- `for` loops
- `while` loops
- `do` `while` loops
- Number operations
- Strings (basic features)
- Objects (only as compile time constants)
- Arrays (only as compile time constants)
- Comparison operators
- Logical operators (`||` and `&&`)
- Ternary operator
- `break` statements
- `continue` statements
- Template strings. Warning: since the mlog environment does not support

```js
let foo = 123;
`print foo`;
printFlush(getBuilding("message1"));
```

- Typescript `as` type cast expressions
- Typescript type assertions
- Typescript `type` declarations
- Typescript `interface` declarations
- Typescript `const` `enum`s
- Typescript non-null assertions (`!` operator on the right)

## Relevant unsupported features

- Closures
- `var` and `function` hoisting
- The DOM library features
- Short circuiting on logical operators
- String methods
- Array methods
- Iterators
- Generator functions
- Generators
- `async`/`await` and related features
- Regex literals
- `BigInt` related features
