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
