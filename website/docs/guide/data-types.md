# Data Types

Because the mlog environment is different from the regular javascript environments, code is structured in a different way.

There are a total of five different data types:

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

Store values are the registers in the game inside a processor.

You can also "sense" their properties as if they were fields.

```js
let a = 123; // is a store number
let b = "string"; // is a store string
typeof b === "store"; // true

const building = getBuilding("conveyor1");
print(building.ammo); // results in a sensor instruction followed by a print instruction

const item = Items.coal;

print(building[item]); // this works too
printFlush();
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

::: warning
Note that operator overriding cannot be checked by typescript, so its use is not recommended.
:::
