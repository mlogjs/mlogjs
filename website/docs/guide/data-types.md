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

Game entities such as buildings, units, and bullets are also store values. You can "sense" their properties as if they were fields:

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

### Senseable entities

- **Buildings**: Senses properties like `health`, `maxHealth`, `totalPower`, `efficiency`, `timescale`, `itemCapacity`, `liquidCapacity`, stored items (`building[Items.copper]`), and liquids (`building[Liquids.water]`).
- **Units**: Senses properties like `health`, `shield`, `armor`, `x`, `y`, `speed`, `rotation`, `elevation`, `mining`, `mineX`, `mineY`, `buildX`, `buildY`, `building`, `breaking`, `flying`, `controlled`, `controller`, and held items. Camera viewport properties (`cameraX`, `cameraY`, `cameraWidth`, `cameraHeight`) can also be sensed on player units, but evaluate to `null` unless executing in a privileged (world) processor.
- **Bullets**: Bullets returned by `spawnBullet` or queries expose properties like `health`, `x`, `y`, `velocityX`, `velocityY`, `rotation`, `team`, `speed`, `bulletLifetime`, and `bulletTime`.

To modify properties of store entities in world processors, use [`setProp`](/guide/commands#setprop).

## Function

Function values are constants.
Functions [can be inlined](./syntax-support.md#functions)

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
