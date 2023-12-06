# Compiler Data Types

Because the mlog environment is different from the regular javascript environments, code is structured in a different way.

To compile your scripts, mlogjs uses four internal types to represent values:

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
```

## Store

Store values are the registers in the game inside a processor.

You can also "sense" their properties as if they were fields.

::: mlogjs-output

```js
let a = 123; // is a store number
let b = "string"; // is a store string

const building = getBuilding("conveyor1");
const item = Items.coal;

print`health: ${building.health}, ${item}: ${building[item]}`;

printFlush();
```

output:
:::

## Function

Function values are constants.

```js
function add(a, b) {
  return a + b;
}
```

## Object

Object values are constants.

```js
const obj = {
  a: 1,
  b: (a, b) => a + b,
};
obj.a; // 1
obj.b(1, 2); // 3
```
