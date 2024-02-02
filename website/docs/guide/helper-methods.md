# Helper methods

## `getBuilding`

Allows you to get a reference to a building linked to the processor by its name.

```js
const turret = getBuilding("cyclone1");
// ...
```

::: info
Values returned from `getBuilding` are always assumed to be constant,
this allows the compiler to optimize the code by treating constants created
that way as aliases.
:::

## `getBuildings`

Returns a record of all the buildings linked to this processor.

The use of this function is preferred if you are assigning
buildings to multiple variables at once.

```js
const { switch1: toggle, cell1 } = getBuildings();
```

## `getColor`

Gets a color literal from a hex code.

```js
const color = getColor("0e7eba");

draw.col(color);
draw.rect({ x: 0, y: 0, width: 500, height: 500 });

drawFlush();
```

## `getVar`

Allows you to access symbols or variables that are not available through the [namespaces](/guide/namespaces).

```js
const building = getBuilding("container1");
const customSymbol = getVar("@awesome-mod-symbol");

const value = sensor(customSymbol, building);

// do somthing after
```

::: warning
Values returned by `getVar` will always be treated as mutable, which means
that a constant bound to it won't be aliased:

::: mlogjs-output

```js
const foo = getVar("@foo");
```

always produces:
:::

## `concat`

Concatenates a list of constant literal values.

```js
const name = "example";

// works with normal arguments
const before = concat("before_", name);

// works with tagged template strings
const after = concat`after_${name}`;
```

## `asm`

Inlines mlog code (can be used with variables and expressions)

```js
const turret = getBuilding("cyclone1");

let first = 10;
let second = 0.2;

// raw use of radar
asm`radar player enemy any distance ${turret} 1 radarResult`;

// temporary values should work too
asm`op mul foo ${first + second} 2`;

print(getVar("radarResult"));
print(getVar("foo"));
printFlush();
```
