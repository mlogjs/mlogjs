# Macros

Macros are features evaluated at compile-time. Their main purpose is to add syntactic sugar for
common tasks such as:

## Sensing properties of entities

Entities (buildings and units) have senseable properties such as their current health, x and y coordinates, item capacity and many more.

In order to make the access of this properties straightforward, buildings and units are macro objects that have their property accesses expanded to sense instructions during compilation.

Note that this shorthand is only valid for symbols under the `LAccess`, `Items` and `Liquids` [namespaces](/namespaces)

```js
const building = getBuilding("container1");

// instead of writing this
let spaceLeft =
  sensor(LAccess.itemCapacity, building) - sensor(LAccess.totalItems, building);

// we can write
let betterSpaceLeft = building.itemCapacity - building.totalItems;
```
