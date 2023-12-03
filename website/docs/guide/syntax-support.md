# Supported javascript/typescript syntax

Since there are drastic differences bewteen the browser environment and
the mlog runtime on mindustry, not all of the existent javascript
features are supported. Bellow is a list containing the most significant supported features.

## Javascript

### Variable declarations

You can declare variables (global or scoped) with the `let`, `const` and `var` keywords

Behavior:

- `const` variables holding values that are also constant will inline that value on the output code.

  ::: mlogjs-output

  ```js
  const a = "string";
  const b = Vars.this;
  const c = getBuilding("message1");
  print(a, " is a string", "\n");
  print(b, "\n");
  printFlush(c);
  ```

  :::
  ::: tip
  It is heavily recommended to declare variables with `const` whenever possible,
  as that gives the compiler more opportunities to optimize the generated code.
  :::

- `var` behaves the same as `let` (see limitations)

Limitations:

- Variables declared with `var` are not hoisted.

### If/else statements

You can use `if` and `else` statements just like in regular javascript without limitations.

```js
const building = getLink(0);

if (building.type === Blocks.message) {
  print("Linked to message block");
} else if (building.type === Blocks.memoryCell) {
  print("Ready to read memory");
} else {
  print("Linked to some block");
}

printFlush();
```

### Switch statements

Switch statements allow you to compare an expressions against many others.

```js
const item = Vars.unit.firstItem;

switch (item) {
  case Items.copper:
  case Items.coal:
  case Items.lead:
    print("Going to cache");
    break;
  case Items.blastCompound:
  case Items.pyratite:
  case Items.silicon:
    print("Going to nearby factory");
    break;
  default:
    print("Nowhere to go");
}

printFlush();
```

Behavior:

- Works just like a javascript switch statement

### Functions

You can declare regular functions using your preferred style:

```js
function classic() {}

const arrow = () => {};

const other = function () {};
```

Behavior:

- Functions will be automatically inlined when the size of the body is smaller than the size of the call
- Some built-in functions such as [asm](/guide/helper-methods#asm) or [print](/guide/commands#print) can be called with tagged template strings.

  ```js
  let a = 1;
  let b = 2;
  let c = 3;

  print("regular style with ", a, " and ", b, " and ", c);
  print`new style with ${a} and ${b} and ${c}`;
  asm`this is inlined into the final code`;
  ```

  ::: info
  This is only possible because the arguments are known at compile time,
  making it possible for the compiler to know how to deal with each case.
  :::

- Functions declarations are hoisted to the top of their declaration scope.

  ```js
  // works
  doSomething();

  function doSomething() {
    print("something");
    printFlush();
  }
  ```

- Functions can have default parameter values:

  ```js
  // works
  print(volume(10));
  printFlush();

  function volume(x, y = x, z = x) {
    return x * y * z;
  }
  ```

- Functions can destructure their arguments:

  ```js
  // works
  const router = getBuilding("router1");

  printPoint(router);
  printPoint(Vars.this);
  print`distance: ${distance([router.x, router.y], [Vars.thisx, Vars.thisy])}`;
  printFlush();

  function printPoint({ x, y }) {
    print`Point(${x}, ${y})\n`;
  }

  function distance([ax, ay], [bx, by]) {
    return Math.len(ax - bx, ay - by);
  }
  ```

Limitations:

- Functions can only be bound to constants
- No `this` context for any kind of function
- Functions cannot act as constructors
- No recursion support
- No proper support for closures
- No support for generators
- No support for `async`/`await`
- No support for spread syntax
- No support for declaring functions that take tagged template strings.

### For loops

You can define the regular style `for` loops:

```js
for (let i = 0; i < 10; i++) {
  print(i);
}
printFlush();
```

Behavior:

- Supports `break` and `continue` statements

Limitations:

- No support for the `for ... of` syntax
- No support for the `for ... in` syntax

### While loop

Repeats the code block while the condition resolves to `true`

```js
let i = 0;
while (i < 10) {
  print(i);
  i++;
}
printFlush();
```

Behavior:

- Supports `break` and `continue` statements

### Do while loop

Executes the code and repeats it while the condition resolves to `true`

```js
let i = 0;
do {
  print(i);
  i++;
} while (i < 10);
printFlush();
```

Behavior:

- Supports `break` and `continue` statements

### Labels

You can use labels to have a finer control over your script's control flow.

```js
block: {
  if (Math.rand(1) > 0.5) break block;
  // do something
}

loop: for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    if (i === j) continue loop;
    print`(${i}, ${j})\n`;
  }
}

printFlush();
```

### Math and related operators

All the mathematical operators for numbers are supported and will be transpiled into mlog code.

But the `Math` object has been modified to match the other math functions
available on the mlog runtime. They are listed bellow:

- `PI` - Pi. This is the ratio of the circumference of a circle to its diameter.
- `E` - The mathematical constant e. This is Euler's number, the base of natural logarithms.
- `degToRad` - The convertion ratio for degress to radians.
- `radToDeg` - The convertion ratio for radians to degrees.
- `abs` - Absolute value of a number
- `angle` - Angle of a vector in degrees
- `angleDiff` - Absolute distance between two angles in degrees.
- `acos` - The arc cosine of a number, in degrees.
- `asin` - The arc sine of a number, in degrees.
- `atan` - The arc tangent of a number, in degrees.
- `ceil` - Rounds the number to the closest bigger integer
- `cos` - Cosine of an angle in degrees
- `floor` - Rounds the number to the closest smaller integer
- `idiv` - Integer part of the division of two numbers.
- `len` - Length of a vector
- `log` - Natural logarithm of a number
- `log10` - Base 10 logarithm of a number
- `max` - Returns the biggest of two values
- `min` - Returns the smallest of two values
- `noise` - 2D simplex noise
- `pow` - Takes a number to a given power (same as the `**` operator).
- `rand` - Random number between 0 (inclusive) and the specified number (exclusive)
- `sin` - Sine of an angle in degrees
- `sqrt` - Square root of a number
- `tan` - Tangent of an angle in degrees

Check out the [online editor](/editor) to see how each one works!

### Logical operators

The logical operators `&&` ("and") and `||` ("or") are supported, and behave in the same way as in regular javascript.

Both [`&&`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND#short-circuit_evaluation) and [`||`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR#short-circuit_evaluation) **short-circuit**.

```js
// foo is either false
// or the output of getSomething()
const foo = isEnabled && getSomething();
```

Behavior:

- `&&`: evaluate the expression on the left and return it if it's falsy, else evaluate and return the expression on the right.
- `||`: evaluate the expression on the left and return it if it's truthy, else evaluate and return the expression on the right.

### Nullish coalescing operator

The nullish coalescing operator (`??`) allows you to lazily evaluated the right side
of the expression when the left side is `undefined`.

```js
const sorter = getBuilding("sorter1");

const itemToFetch = sorter.config ?? Items.graphite;

// make an unit fetch the item
```

Behavior:

- Evaluates the left side, if it resolves to `undefined` it evaluates the right side and returns its value

### Ternary operator (conditional expression)

The ternary operator allows you to conditionally return a value based on an expression.

```js
const container = getBuilding("container1");

const item = container.totalItems < 200 ? Items.titanium : Items.lead;

print(item);
printFlush();
```

Behavior:

- It evaluates each return value lazily according to the test condition.

### Object/array literals

Objects and arrays are [compile time constants](/guide/data-types#objects), which means that the values they hold cannot be reassigned.

Their most common use case is scoping data in a convenient way.

```js
const builds = {
  message: getBuilding("message1"),
  turret: getBuilding("cyclone1"),
};

const target = radar({
  building: builds.turret,
  filters: ["player", "enemy", "any"],
  order: true,
  sort: "distance",
});

control.shootp({
  building: builds.turret,
  unit: target,
  shoot: true,
});

print("Shooting ", target);
printFlush(builds.message);
```

Behavior:

- Works just like [constants](#variable-declarations), inlines each value on the places it's used.
- Arrays have a compile time constant `length` property.
- Objects can be declared with getters and setters

Limitations:

- These kinds of objects and arrays cannot be mutated.

### Destructuring

You can use destructuring to assign or declare variables.

It is treated by the compiler as a sintactic sugar for assignments/declarations that are based on object properties. The following examples have exactly the same behavior:

```js
const turret = getBuilding("cyclone1");
const { x, y, health } = turret;
```

```js
const turret = getBuilding("cyclone1");
const x = turret.x;
const y = turret.y;
const health = turret.health;
```

Behavior:

- Assigns each destructured expression in the declaration order
- Destructuring expressions CAN be nested.

  ```js
  const [found, x, y, { totalItems }] = unitLocate.building({
    group: "core",
    enemy: false,
  });
  ```

- Destructuring expressions can have default values.

  ```js
  const { firstItem = Items.graphite } = Vars.unit;
  ```

Limitations:

- Because this is just syntactic sugar to make multiple assignments, you can't do variable swaps.
  ::: warning

  This doesn't work

  ```js
  [a, b] = [b, a];
  ```

  :::

### Modules

Currently, you can only import the functionality of modules that are built into mlogjs, such as `mlogjs:world`. However you can still use type imports in typescript files:

```ts
// works
import { explosion } from "mlogjs:world";
import type { Foo } from "./my_module";
```

## Typescript

### Enums

You can declare `const` `enum`s on your code as if it were regular typescript

```ts
const enum Status {
  traveling,
  mining,
}
```

Behavior:

- Each enum member will be bound to a number by default (with auto incrementing indexes), they can also be string literals
- Just like [constants](#variable-declarations), enum members are replaced with their literal values

Limitations:

- All enums must be `const`, since dynamic objects are not supported in the mlog runtime

### Type casts

You can type cast variables to narrow the type of a variable.

Note that the mlogjs compiler does not take in account for the typescript types of variables and expressions.

### Types/interfaces

You can declare custom type aliases and interfaces. Since the compiler does not perform typescript's type checking, it will simply ignore these kinds of declarations.

### Non null assertions

Again, this one is ignored by the compiler, use it to make typescript happy, though most of the time you should check if nullable variables are `undefined` before using them.
