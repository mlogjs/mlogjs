---
outline: [2, 4]
---

# Commands

Commands are built in function macros that expand into instructions during compilation.

Here is a list of them, some have multiple overloads

Overloaded commands have the following syntax:

```js
command.variant();
```

## Input/output

### `print`

Appends the items to the print buffer, calling this function
on its own will not print any contents to a message block.

To print the contents of the print buffer and empty it, call `printFlush`.

```js
// call normally
print("a + b = ", left, " + ", right, " = ", left + right);

// call with tagged string templates
print`a + b = ${left} + ${right} = ${left + right}`;
```

### `draw`

Contains the multiple variants of the `draw` instruction

::: warning
Nothing is drawn until `drawFlush` is called.
:::

- #### `draw.clear`

  Fills the screen with a color.

  ```js
  draw.clear(0, 0, 0); // black screen
  ```

- #### `draw.color`

  Sets the color for the next drawing operations.

  Each parameter must be within range: [0, 255].

  ```js
  draw.color(255, 255, 255, 128);
  ```

- #### `draw.stroke`

  Sets the width of the next lines to be drawn.

  ```js
  draw.stroke(15);
  ```

- #### `draw.line`

  Draws a line between two points.

  ```js
  draw.line({ x: 5, y: 5, x2: 50, y2: 50 });
  ```

- #### `draw.rect`

  Draws a filled rectangle.

  ```js
  draw.rect({
    x: 10,
    y: 15,
    height: 60,
    width: 40,
  });
  ```

- #### `draw.lineRect`

  Draws a rectangle outline.

  ```js
  draw.lineRect({
    x: 10,
    y: 15,
    height: 60,
    width: 40,
  });
  ```

- #### `draw.poly`

  Draws a filled, regular polygon.

  - `sides` - The number of sides the polygon should have
  - `radius` - The smallest distance between a line and the center of the polygon
  - `rotation` - The rotation of the polygon in degree

  ```js
  draw.poly({
    radius: 10,
    rotation: 0,
    sides: 10,
    x: 25,
    y: 25,
  });
  ```

- #### `draw.linePoly`

  Draws the outline of a regular polygon.

  - `sides` - The number of sides the polygon should have
  - `radius` - The smallest distance between a line and the center of the polygon
  - `rotation` - The rotation of the polygon in degree

  ```js
  draw.linePoly({
    radius: 10,
    rotation: 0,
    sides: 10,
    x: 25,
    y: 25,
  });
  ```

- #### `draw.triangle`

  Draws a filled triangle.

  ```js
  draw.triangle({
    x: 10,
    y: 10,
    x2: 20,
    y2: 20,
    x3: 30,
    y3: 10,
  });
  ```

- #### `draw.image`

  Draws an image of the respective content. (like `Units.dagger` and `Blocks.router`)

  - `image` - The symbol for the image to be drawn.
  - `rotation` - The rotation of the image in degrees.

  ```js
  // draw a router
  draw({
    mode: "image",
    x: 30,
    y: 30,
    image: Blocks.router,
    size: 15,
    rotation: 0,
  });

  // draw the unit bound to the processor
  draw({
    mode: "image",
    x: 60,
    y: 60,
    image: Vars.unit.type,
    size: 15,
    rotation: 0,
  });
  ```

## Block Control

### `printFlush`

Writes the contents of the print buffer into the target message
and clears the buffer afterwards.

- `target` The message building to write to. Writes to `message1` by default.

  Note that the default value only applies if you don't pass any parameter to this function.

```js
const message = getBuilding("message2");
printFlush(message);

printFlush(); // defaults to message1
```

### `drawFlush`

Writes the contents of the draw buffer into the target display
and clears the buffer afterwards.

- `target` The display building to write to. Writes to `display1` by default.

  Note that the default value only applies if you don't pass any parameter to this function.

```js
const display = getBuilding("display2");
drawFlush(display);

drawFlush(); // defaults to display1
```

### `getLink`

Gets a block link by its index.

To make safe queries it is recommended to check an index
before trying to get a link. This can be done by using `Vars.links`.

```js
if (index < Vars.links) {
  let myBlock = getLink(index);
  // ...
}
```

### `control`

Contains the multiple variants of the `control` instruction

- #### `control.enabled`

  Sets whether the building is enabled or disabled.

  ```js
  const conveyor = getBuilding("conveyor1");
  control.enabled(conveyor, false);
  ```

- #### `control.shoot`

  Makes the building shoot or aim at the given position

  - `building` - The shooting building
  - `shoot` - `true` to shoot, `false` to just aim at the position

  ```js
  control.shoot({
    building: getBuilding("cyclone1"),
    shoot: true,
    x: Vars.thisx,
    y: Vars.thisy,
  });
  ```

- #### `control.shootp`

  Shoot at an unit with velocity prediction

  - `building` - The shooting building
  - `unit` - The target unit
  - `shoot` - `true` to shoot, `false` to just aim

  ```js
  const turret = getBuilding("cyclone1");

  const player = radar({
    building: turret,
    filters: ["player", "any", "any"],
    order: true,
    sort: "distance",
  });

  control.shootp({
    building: turret,
    unit: player,
    shoot: true,
  });
  ```

- #### `control.config`

  Sets the config of a block (like the item of a sorter)

  ```js
  const sorter = getBuilding("sorter1");

  control.config(sorter, Items.copper);
  ```

- #### `control.color`

  Sets the color of an illuminator.

  The RGB values must be within the range: [0, 255].

  ```js
  const illuminator = getBuilding("illuminator1");

  control.color(illuminator, 10, 150, 210);
  ```

### `radar`

Detects an unit nearby this `building`.

- `building` - The building used to detect potential targets
- `filters` - The filters for selecting a target. Use "any" for any target.
- `order` - `true` to get the first result, `false` to get the last result.
- `sort` - The method on which the results should be sorted

Example:

```js
const turret = getBuilding("cyclone1");
// returns the second nearest enemy unit
const result = radar({
  building: turret,
  filters: ["enemy", "any", "any"],
  order: 2,
  sort: "distance",
});
```

### `sensor`

Alternate way to access special properties on objects.

This method allows you to use customly created symbols
and sensor them on buildings.

- `property` - The property to be sensed on the building
- `target` - The object that will be "sensed"

```ts
let myBuilding = getBuilding("container1");

// typescript annotation, you can use jsdoc comments on
// regular javascript
let myCustomSymbol = getVar<symbol>("@custom-symbol"); // problably defined by a mod
let result = sensor(myCustomSymbol, myBuilding);
```

## Operations

### `lookup`

Looks up content symbols by their index.

- #### `lookup.block`

  Looks up a block symbol by it's index on the content registry.

  Use `Vars.blockCount` to check the maximum index allowed.

  ```js
  if (index < Vars.blockCount) {
    let blockKind = lookup.block(index);
  }
  ```

- #### `lookup.unit`

  Looks up an unit symbol by it's index on the content registry.

  Use `Vars.unitCount` to check the maximum index allowed.

  ```js
  if (index < Vars.unitCount) {
    let unitKind = lookup.unit(index);
  }
  ```

- #### `lookup.item`

  Looks up an item symbol by it's index on the content registry.

  Use `Vars.itemCount` to check the maximum index allowed.

  ```js
  if (index < Vars.itemCount) {
    let itemKind = lookup.item(index);
  }
  ```

- #### `lookup.liquid`

  Looks up a liquid symbol by it's index on the content registry.

  Use `Vars.liquidCount` to check the maximum index allowed.

  ```js
  if (index < Vars.liquidCount) {
    let liquidKind = lookup.liquid(index);
  }
  ```

### `packColor`

Packs RGBA color information into a single number.

Each paremeter must range from `0` to `1`.

```js
const colorData = packColor(0.1, 0.6, 0.8, 0.1);

// world processor only
setRule.ambientLight(colorData);
```

## Flow control

### `wait`

Stops the execution for the given amount of seconds

```js
print("before");
printFlush();
wait(3.5);
print("after");
printFlush();
```

### `endScript`

Jumps to the top of the instruction stack

```js
const { enabled } = getBuilding("switch1");

if (!enabled) endScript();
// do something when the switch is enabled
```

### `stopScript`

Halts the execution of this processor. Can be used to debug code and analyze the processor registers.

```js
// stop the processor to debug variables
stopScript();
```

## Unit control

### `unitBind`

Binds an unit to the this processor. The unit is accessible at `Vars.unit`.

```js
unitBind(Units.flare);

const { x, y } = Vars.unit;

print`x: ${x} y: ${y}`;
printFlush();
```

### `unitControl`

Controls the unit bound to the processor

- #### `unitControl.idle`

  Makes the unit bound to this processor stop moving but
  allows it to keep doing it's action (like mining or building).

  ```js
  unitControl.idle();
  ```

- #### `unitControl.stop`

  Makes the unit bound to this processor stop mining, building and moving

  ```js
  unitControl.stop();
  ```

- #### `unitControl.move`

  Makes the unit bound to this processor move to the given position

  ```js
  unitControl.move(10, 20);
  ```

- #### `unitControl.approach`

  Makes the unit bound to this processor approach the given position at the given radius

  - `radius` - How distant to the position the unit can be

  ```js
  unitControl.approach({
    x: 15,
    y: 30,
    radius: 5,
  });
  ```

- #### `unitControl.boost`

  Whether the unit bound to this processor should be boosted (floating).

  ```js
  unitControl.boost(true);
  ```

- #### `unitControl.pathfind`

  Makes the unit bound to this processor move to the enemy spawn

  ```js
  unitControl.pathfind();
  ```

- #### `unitControl.target`

  Makes the unit bound to this processor shoot/aim at the given position

  - `shoot` - `true` to shoot, `false` to just aim

  ```js
  unitControl.target({
    shoot: true,
    x: 15,
    y: 30,
  });
  ```

- #### `unitControl.targetp`

  Makes the unit bound to this processor target an unit with velocity prediction

  - `unit` - The shoot target
  - `shoot` - `true` to shoot, `false` to just aim

  ```js
  const player = unitRadar({
    filters: ["player", "any", "any"],
    order: true,
    sort: "distance",
  });

  unitControl.targetp({
    shoot: true,
    unit: player,
  });
  ```

- #### `unitControl.itemDrop`

  Makes the unit bound to this processor drop it's held items onto the given target

  - `target` - Where to drop the items, if `Blocks.air`, the unit will throw it's items away
  - `amount` - How many items should be dropped

  ```js
  const container = getBuilding("container1");

  // ...

  // drop 40 items on the container
  unitControl.itemDrop(container, 40);

  // ...

  // discard 10 items from the current unit
  unitControl.itemDrop(Blocks.air, 10);
  ```

- #### `unitControl.itemTake`

  Makes the unit bound to this processor take items from a building

  - `target` - The building that will have it's items taken
  - `item` - The kind of item to take
  - `amount` - How many items should be taken

  ```js
  const vault = getBuilding("vault1");

  // bind unit and move to the valult...

  unitControl.itemTake(vault, Items.graphite, 50);

  // do something with the graphite...
  ```

- #### `unitControl.payDrop`

  Makes the unit bound to this processor drop one entity from it's payload

  ```js
  unitControl.payDrop();
  ```

- #### `unitControl.payTake`

  Makes the unit bound to this processor take an entity into it's payload

  - `takeUnits` - Whether to take units or buildings

  ```js
  unitControl.payTake({
    takeUnits: true,
  });
  ```

- #### `unitControl.payEnter`

  Makes the unit bound to this processor enter/land on the
  payload block the unit is on

  ```js
  unitControl.payEnter();
  ```

- #### `unitControl.mine`

  Makes the unit bound to this processor mine at the given position

  ```js
  unitControl.mine(10, 20);
  ```

- #### `unitControl.flag`

  Sets the numeric flag of the unit bound to this processor

  ```js
  const localFlag = 123;

  unitControl.flag(localFlag);
  ```

- #### `unitControl.build`

  Makes the unit bound to this processor build a building with the
  given properties

  - `block` - The kind of building to build
  - `rotation` - The rotation of the building, ranges from 0 to 3
  - `config` - The config of the building

  ```js
  unitControl.build({
    x: 10,
    y: 20,
    block: Blocks.sorter,
    rotation: 1,
    config: Items.silicon,
  });
  ```

- #### `unitControl.getBlock`

  Makes the unit bound to this processor get data about a block at the given position

  ```js
  const [type, building] = unitControl.getBlock(10, 20);

  // do something with the results
  ```

- #### `unitControl.within`

  Checks if the unit bound to this processor is within a radius of a given position.

  ```js
  unitControl.within({
    x: 10,
    y: 20,
    radius: 5,
  });
  ```

### `unitRadar`

Finds an unit near the unit bound to this processor

- `filters` - The filters for selecting a target. Use "any" for any target.
- `order` - `true` to get the first result, `false` to get the last result.
- `sort` - The method on which the results should be sorted

Example:

```js
// returns the second nearest enemy unit
const result = unitRadar({
  filters: ["enemy", "any", "any"],
  order: 2,
  sort: "distance",
});
```

### `unitLocate`

Uses the unit bound to this processor to find specific types of blocks

- #### `unitLocate.ore`

  Uses the unit bound to this processor to find an ore vein anywhere on the map

  - `ore` - The kind of item the ore should contain

  ```js
  const [found, x, y] = unitLocate.ore(Items.copper);

  if (found) {
    unitControl.approach({ x, y, radius: 5 });
  }
  ```

- #### `unitLocate.building`

  Uses the unit bound to this processor to find a building anywhere on the map

  - `group` - The group that the building belongs to
  - `enemy` - Whether it should be an enemy building or an ally one

  ```js
  const vault = getBuilding("vault1");
  const takeAmount = 100;

  unitBind(Units.mega);

  // we don't use the `found` variable
  // because we always have our own core
  const [, x, y, core] = unitLocate.building({
    group: "core",
    enemy: false,
  });

  const location = {
    x,
    y,
    radius: 5,
  };

  if (!unitControl.within(location) && Vars.unit.totalItems == 0) {
    // if the unit has no items and it is not near
    // the core, move it to the core
    // and take 100 copper
    unitControl.approach(location);
    unitControl.itemTake(core, Items.copper, takeAmount);
  } else {
    // else, approach the vault and drop the items on it
    unitControl.approach({
      x: vault.x,
      y: vault.y,
      radius: 5,
    });
    unitControl.itemDrop(vault, takeAmount);
  }
  ```

- #### `unitLocate.spawn`

  Uses the unit bound to this processor to find an enemy spawn anywhere on the map.

  Returns the enemy spawn point or its core, if it exists.

  ```js
  const [found, x, y, core] = unitLocate.spawn();

  if (!found) {
    print("No enemy core found");
  } else if (core) {
    print`core location at (${x}, ${y})`;
  } else {
    print`enemy spawn at (${x}, ${y})`;
  }

  printFlush();
  ```

- #### `unitLocate.damaged`

  Uses the unit bound to this processor to find a damaged ally buildings anywhere on the map

  ```js
  const [found, x, y, building] = unitLocate.damaged();

  if (found) {
    print`go fix a ${building} at (${x}, ${y})`;
  } else {
    print("No damaged building found");
  }
  printFlush();
  ```

## World

These commands are exclusive to world processors and will not work
on regular processor

- `getBlock` - Gets block data on a given location
- `setBlock` - Sets block data on a given location
- `spawnUnit` - Spawns an unit at a give location
- `applyStatus` - Applies a status effect to an unit
- `spawnWave` - Spawns a wave
- `setRule` - Sets a game rule
- `flushMessage` - Consumes content of the print buffer and displays it on the gui
- `cutscene` - Controls the player camera
- `explosion` - Creates an explosion
- `setRate` - Sets the speed of this processor
- `fetch` - Looks up players/buildings/units by index
- `getFlag` - Checks if a global flag is set
- `setFlag` - Sets a global flag
