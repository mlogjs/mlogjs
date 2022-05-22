# Supported javascript/typescript syntax

Since there drastic differences bewteen the browser environment and
the mlog runtime on mindustry, not all of the existent javascript
features are supported. Bellow are lists containing the most significant supported and
unsupported features, along with some that could be supported in the future.

## Javascript

### Variable declarations

You can declare variables (global or scoped) with the `let`, `const` and `var` keywords

Behavior:

- `const` variables holding a literal will inline that value on the output code.

```js
const foo = "string";
print(foo);
print(foo, " and another");
```

```
print "string"
print "string"
print " and another"
```

- `var` behaves the same as `let` (see limitations)

Limitations:

- Variables declared with `var` are not hoisted.

### If/else statements

You can use `if` and `else` statements just like in regular javascript without limitations.

```js
const message = getBuilding("message1");
const building = getLink(0);

if (building.type === Blocks.message) {
  print("Linked to message block");
} else if (building.type === Blocks.memoryCell) {
  print("Ready to read memory");
} else {
  print("Linked to some block");
}

printFlush(message);
```

### Functions

You can declare regular functions using your preferred style:

```js
function classic() {}

const arrow = () => {};

const other = function () {};
```

Behavior:

- Functions will be automatically inlined when the size of the body is smaller than the size of the call

Limitations:

- Functions can only be bound to constants
- No `this` context for any kind of function
- Functions cannot act as constructors
- No recursion support
- Functions declarations are not hoisted
- No proper support for closures
- No support for generators
- No support for `async`/`await`

### For loops

You can define the regular style `for` loops:

```js
for (let i = 0; i < 10; i++) {
  print(i);
}
printFlush(getBuilding("message1"));
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
printFlush(getBuilding("message1"));
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
```

Behavior:

- Supports `break` and `continue` statements

### Math and related operators

All the mathematical operators for numbers are supported and will be transpiled into mlog code.

But the `Math` object has been modified to match the other math functions
available on the mlog runtime. They are listed bellow:

- `abs` - Absolute value of a number
- `angle` - Angle of a vector in degrees
- `ceil` - Rounds the number to the closest bigger integer
- `cos` - Cosine of an angle in degrees
- `floor` - Rounds the number to the closest smaller integer
- `len` - Length of a vector
- `log` - Natural logarithm of a number
- `log10` - Base 10 logarithm of a number
- `max` - Returns the biggest of two values
- `min` - Returns the smallest of two values
- `noise` - 2D simplex noise
- `rand` - Random number between 0 (inclusive) and the specified number (exclusive)
- `sin` - Sine of an angle in degrees
- `sqrt` - Square root of a number
- `tan` - Tangent of an angle in degrees

Check out the [online editor](https://mlogjs.github.io/mlogjs/editor/) to see how each one works!

### Logical operators

The logical operators `&&` (and) and `||` (or) are supported, although they DO NOT short-circuit. See [What is short-circuiting?](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND#short-circuit_evaluation)

Another caution you must take is that differently from regular javascript, these operators will ALWAYS return boolean values, which means that code like this will not work.

```js
// WARNING: does not work
// first: both expressions are evaluated because there is no
// short circuiting
//
// second: the final value will be a boolean, not
// whathever object getSomething returns
let foo = isEnabled && getSomething();
```

Behavior:

- The operators evaluate all of the expressions and return a boolean value

Limitations:

- No short-circuiting support
- These expressions cannot return anything other than a boolean

### Ternary operator (conditional expression)

The ternary operator allows you to conditionally return a value based on an expression.

```js
const container = getBuilding("container1");

const item = container.totalItems < 200 ? Items.titanium : Items.lead;

print(item);
printFlush(getBuilding("message1"));
```

Behavior:

- Unlike the [logical operators](#logical-operators) it evaluates each return value lazily.

### Destructuring

You can use destructuring to assign or declare variables.

It is treated by the compiler as a sintactic sugar for assignments/declarations that are based on object properties. The following examples have exactly the same output:

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
const [found, x, y, { totalItems }] = unitLocate("building", "core", false);
```

Limitations:

- Because this is just syntactic sugar to make multiple assignments, you can't do variable swaps.

```js
// WARNING: does not work
[a, b] = [b, a];
```

- There is no support for default values inside destructuring assignments/declarations.

```js
// WARNING: does not work
const { firstItem = Items.copper } = building;
```

> This happens because this feature _should_ only assign the default value if the object
> does not have the wanted key, but this can't be safely done on the compiler side because it
> doesn't know whether the object has such property, and cheking for `null`
> is not a viable option because returning `null` does not necessarily mean
> that the property doesn't exist.

### Template strings

Template strings in javascript allow you to interpolate values with strings in
a convenient way.

But since the mlog runtime doesn't support string contenation template strings are used to
inline mlog code.

The following has it's last line inlined onto the output.

```js
const conveyor = getBuilding("conveyor1");
const message = getBuilding("message1");

print(conveyor.x, conveyor.y);

`printflush ${message}`;
```

```
sensor &t0 conveyor1 @x
sensor &t1 conveyor1 @y
print &t0
print &t1
printflush message1
end
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

Again, this one is ignored by the compiler, use it to make typescript happy, though most of the time you should check if nullable variables are `null` before using them.
