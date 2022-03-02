# Data Types

Because the mlog environment is different from the regular javascript environments, code is structured in a different way.

There are a total of four different data types:

- Literal
- Store
- Function
- Object

## Literal

Literal values are the raw values that you write directly. They are constant strings or numbers.

```js
123; // is a literal
const a = 123; // is a literal as well
const b = "some string"; // string literal
typeof a === "literal"; // true
```

## Store

Store values are the registers in the game inside a processor. They are mutable.

```js
let a = 123; // is a store number
let b = "string"; // is a store string
typeof b === "store"; // true
```

## Function

Function values are constants.

```js
function add(a, b) {
  return a + b;
}
typeof add === "function"; // true
```

## Object

Object values are constants and support operator overriding.

Note that operator overriding cannot be checked by typescript, so it's use is not recommended.

```js
const obj = {
  a: 1,
  b: (a, b) => a + b,
  $call: (a, b) => a * b,
};
obj.a; // 1
obj.b(1, 2); // 3
obj(2, 2); // 4
typeof obj === "object"; // true
```
