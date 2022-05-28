# Helper methods

## getBuilding

Allows you to get a reference to a building linked to the processor by its name.

```js
const turret = getBuilding("cyclone1");
// ...
```

> Values returned from `getBuilding` are always assumed to be constant,
> this allows the compiler to optimize the code by treating constants created
> that way as aliases.

## getVar

Allows you to access symbols or variables that are not available through the [namespaces](/namespaces).

```js
const building = getBuilding("container1");
const customSymbol = getVar("@awesome-mod-symbol");

let value = sensor(customSymbol, building);

// do somthing after
```

> Values returned by `getVar` will always be treated as mutable, which means
> that a constant bound to it won't be aliased:
>
> ```js
> const foo = getVar("@foo");
> ```
>
> always produces:
>
> ```mlog
> set foo:1:6 @foo
> end
> ```

## concat

Allows you to concatenate a series of constant strings.

```js
const programVersion = "2";
const programName = "special-program";
const fullName = concat(programName, "-v", programVersion);

// ...
```
