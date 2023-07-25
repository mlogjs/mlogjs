---
outline: [2, 3]
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

- #### `draw.col`

  Sets the color for the next drawing operations.

  Uses compressed rgba data from `packColor`.

  ```js
  draw.col(packColor(1, 1, 1, 1));
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
  draw.image({
    x: 30,
    y: 30,
    image: Blocks.router,
    size: 15,
    rotation: 0,
  });

  // draw the unit bound to the processor
  draw.image({
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
  const myBlock = getLink(index);
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

  ```js
  const illuminator = getBuilding("illuminator1");

  control.color(illuminator, packColor(0.2, 0.65, 1, 1));
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
// returns the furthest enemy unit
const result = radar({
  building: turret,
  filters: ["enemy", "any", "any"],
  order: false,
  sort: "distance",
});
```

### `sensor`

Alternate way to access special properties on objects.

This method allows you to use customly created symbols
and sensor them on buildings.

- `property` - The property to be sensed on the building
- `target` - The object that will be "sensed"

::: code-group

```ts [script.ts]
const myBuilding = getBuilding("container1");

// problably defined by a mod
const myCustomSymbol = getVar<symbol>("@custom-symbol");
const result = sensor(myCustomSymbol, myBuilding);
```

```js [script.js]
const myBuilding = getBuilding("container1");

// probably defined by a mod
/** @type {symbol} */
const myCustomSymbol = getVar("@custom-symbol");
const result = sensor(myCustomSymbol, myBuilding);
```

:::

## Operations

### `lookup`

Looks up content symbols by their index.

- #### `lookup.block`

  Looks up a block symbol by it's index on the content registry.

  Use `Vars.blockCount` to check the maximum index allowed.

  ```js
  if (index < Vars.blockCount) {
    const blockKind = lookup.block(index);
  }
  ```

- #### `lookup.unit`

  Looks up an unit symbol by it's index on the content registry.

  Use `Vars.unitCount` to check the maximum index allowed.

  ```js
  if (index < Vars.unitCount) {
    const unitKind = lookup.unit(index);
  }
  ```

- #### `lookup.item`

  Looks up an item symbol by it's index on the content registry.

  Use `Vars.itemCount` to check the maximum index allowed.

  ```js
  if (index < Vars.itemCount) {
    const itemKind = lookup.item(index);
  }
  ```

- #### `lookup.liquid`

  Looks up a liquid symbol by it's index on the content registry.

  Use `Vars.liquidCount` to check the maximum index allowed.

  ```js
  if (index < Vars.liquidCount) {
    const liquidKind = lookup.liquid(index);
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

If an unit symbol is received, the processor will pick an
unit of the given type.

If an unit object is received, the processor will bind to the unit.

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

- #### `untiControl.pathfind`

  Makes the unit bound to this processor move to the given location.

  Uses the unit's pathfinding algorithm to decide how to
  reach the desired location instead of blidly going in a straight line.

  ```js
  // makes flares follow the player's cursor
  const turret = getBuilding("foreshadow1");

  const player = radar({
    building: turret,
    filters: ["player", "any", "any"],
    order: true,
    sort: "distance",
  });

  unitBind(Units.flare);

  unitControl.pathfind(player.shootX, player.shootY);
  ```

- #### `unitControl.boost`

  Whether the unit bound to this processor should be boosted (floating).

  ```js
  unitControl.boost(true);
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
  const [type, building, floor] = unitControl.getBlock(10, 20);

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

- #### `unitControl.unbind`

  Resets the AI of the unit.

  Calling `unbind` does not actually unbind the unit from the processor,
  it just makes the unit resume its natural behavior.

  ```js
  unitControl.unbind();
  ```

### `unitRadar`

Finds an unit near the unit bound to this processor

- `filters` - The filters for selecting a target. Use "any" for any target.
- `order` - `true` to get the first result, `false` to get the last result.
- `sort` - The method on which the results should be sorted

Example:

```js
// returns the furthest enemy unit
const result = unitRadar({
  filters: ["enemy", "any", "any"],
  order: false,
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

### `getBlock`

Gets block data from the map. Available ONLY for world processors.

- #### `getBlock.floor`

  Gets the floor type on the given location

  ```js
  const floorType = getBlock.floor(10, 20);
  ```

- #### `getBlock.ore`

  Gets the ore type on the given location. `Blocks.air` if there is no ore

  ```js
  const oreType = getBlock.ore(10, 20);

  if (oreType != Blocks.air) {
    print("found ", oreType);
  } else {
    print("no ore found");
  }
  printFlush();
  ```

- #### `getBlock.block`

  Gets the block type on the give location. `Blocks.air` if there is no block.

  ```js
  const blockType = getBlock.block(10, 20);

  if (blockType != Blocks.air) {
    print("found ", blockType);
  } else {
    print("no block found");
  }
  printFlush();
  ```

- #### `getBlock.building`

  Gets the building on the given location. `undefined` if there is no building.

  ```js
  const building = getBlock.building(10, 20);

  if (building != undefined) {
    print("found ", building, "");
  } else {
    print("no building found");
  }
  printFlush();
  ```

### `setBlock`

- #### `setBlock.floor`

  Sets the floor of the tile at the given location.

  ```js
  setBlock.floor(10, 20, Blocks.metalFloor5);
  ```

- #### `setBlock.ore`

  Sets the ore at the given location. Use `Blocks.air` to remove any ore.

  ```js
  setBlock.ore(10, 20, Blocks.oreCopper);
  ```

- #### `setBlock.block`

  Sets the block at a given location, it can be a regular building or an environment block.

  ```js
  setBlock.block({
    x: 10,
    y: 20,
    to: Blocks.router,
    rotation: 0,
    team: Teams.sharded,
  });
  ```

### `spawnUnit`

Spawns an unit at the given location.

- `rotation` - The initial rotation of the unit in degrees.

```js
spawnUnit({
  team: Teams.sharded,
  type: Units.flare,
  x: 10,
  y: 20,
  rotation: 90,
});
```

### `applyStatus`

Contains the variants for the `applyStatus` instruction.

- #### `applyStatus.apply`

  Applies a status effect to the given unit.

  The only status effects that don't require a duration are `overdrive` and `boss`.

  ```js
  applyStatus.apply("burning", Vars.unit, 10);
  applyStatus.apply("boss", Vars.unit);
  ```

- #### `applyStatus.clear`

  Removes a status effect to the given unit.

  ```js
  applyStatus.clear("burning", Vars.unit);
  applyStatus.clear("boss", Vars.unit);
  ```

### `spawnWave`

Spawns an enemy wave, can be used even if there is an already active wave.

```js
// natural wave, units appear on the enemy spawn
spawnWave(true);

// syntethic wave, units appear on the given coordinates
spawnWave(false, 10, 20);
```

### `setRule`

Contains the multiple variants of the `setrule` instruction.

- #### `setRule.currentWaveTime`

  Sets the wave countdown in seconds.

  ```js
  setRule.currentWaveTime(10);
  ```

- #### `setRule.waveTimer`

  Enables/disables the wave timer.

  ```js
  setRule.waveTimer(true);
  ```

- #### `setRule.waves`

  Allows or prevents waves from spawning.

  ```js
  setRule.waves(true);
  ```

- #### `setRule.wave`

  Sets the current wave number.

  ```js
  setRule.wave(10);
  ```

- #### `setRule.waveSpacing`

  Sets the time between waves in seconds.

  ```js
  setRule.waveSpacing(180);
  ```

- #### `setRule.waveSending`

  Sets wether waves can be manually summoned by pressing the play button.

  ```js
  setRule.waveSending(true);
  ```

- #### `setRule.attackMode`

  Sets wether the gamemode is the attack mode

  ```js
  setRule.attackMode(true);
  ```

- #### `setRule.enemyCoreBuildRadius`

  Sets the radius of the no-build zone around enemy cores.

  ```js
  setRule.enemyCoreBuildRadius(150);
  ```

- #### `setRule.dropZoneRadius`

  Sets the radius around enemy wave drop zones.

  ```js
  setRule.dropZoneRadius(20);
  ```

- #### `setRule.unitCap`

  Sets the base unit cap.

  ```js
  setRule.unitCap(40);
  ```

- #### `setRule.mapArea`

  Sets the playable map area. Blocks that are out of the new bounds will be removed.

  ```js
  setRule.mapArea({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
  });
  ```

- #### `setRule.lighting`

  Sets wether ambient lighting is enabled

  ```js
  setRule.lighting(true);
  ```

- #### `setRule.ambientLight`

  Sets the ambient light color.
  `packColor` can be used to get the RGBA data recevied by this function.

  ```js
  // enables lighting and sets the color to gray
  setRule.lighting(true);
  setRule.ambientLight(packColor(0.5, 0.5, 0.5, 1));
  ```

- #### `setRule.solarMultiplier`

  Sets the multiplier for the energy output of solar panels.

  ```js
  setRule.solarMultiplier(10);
  ```

- #### `setRule.buildSpeed`

  Sets the build speed multiplier of a team.

  The multiplier will always be clamped between `0.001` and `50`.

  ```js
  setRule.buildSpeed(Teams.sharded, 1.5);
  ```

- #### `setRule.unitBuildSpeed`

  Sets the speed multiplier for unit factories.

  The multiplier will always be clamped between `0` and `50`.

  ```js
  setRule.unitBuildSpeed(Teams.sharded, 3);
  ```

- #### `setRule.unitCost`

  Sets the build cost multiplier for constructing units.

  ```js
  setRule.unitCost(Teams.sharded, 1.75);
  ```

- #### `setRule.unitDamage`

  Sets the damage multiplier for units on a given team.

  ```js
  setRule.unitDamage(Teams.sharded, 1.25);
  ```

- #### `setRule.blockHealth`

  Sets the block health multiplier for a given team.

  ```js
  setRule.blockHealth(Teams.crux, 0.75);
  ```

- #### `setRule.blockDamage`

  Sets the block damage multiplier for a given team.

  ```js
  setRule.blockDamage(Teams.crux, 2);
  ```

- #### `setRule.rtsMinWeight`

  Sets the Real Time Strategy minimum weight for a team.

  In other words it, sets the minimum "advantage" needed for a squad to attack.
  The higher the value, the more cautious the squad is.

  ```js
  setRule.rtsMinWeight(Teams.sharded, 3);
  ```

- #### `setRule.rtsMinSquad`

  Sets the Real Time Strategy minimum size of attack squads of a team.

  The higher the value, the more units are required before a squad attacks.

  ```js
  setRule.rtsMinSquad(Teams.sharded, 5);
  ```

### `flushMessage`

Writes the contents of the print buffer in the selected mode
and clears the buffer afterwards. World processor ONLY.

```js
print("Hello");
flushMessage.announce(4); // lasts 4 seconds
wait(5);
print("World");
flushMessage.toast(4);
wait(5);
```

- #### `flushMessage.notify`

  Shows a nofication at the top of the screen

  ```js
  print("something");
  flushMessage.notify();
  ```

- #### `flushMessage.mission`

  Puts the content on the top left corner of the screen

  ```js
  print("something");
  flushMessage.mission();
  ```

- #### `flushMessage.announce`

  Puts the content on the middle of the screen

  - `duration` - The duration, in seconds

  ```js
  print("something");
  flushMessage.announce(3);
  ```

- #### `flushMessage.toast`

  Puts the content on the middle top of the screen

  - `duration`- The duration, in seconds

  ```js
  print("something");
  flushMessage.toast(5);
  ```

### `cutscene`

- #### `cutscene.pan`

  Moves the player's camera to the given location.

  ```js
  cutscene.pan({
    x: 10,
    y: 20,
    speed: 15,
  });
  ```

- #### `cutscene.zoom`

  Zooms the player camera to the desired level

  ```js
  cutscene.zoom(3);
  ```

- #### `cutscene.stop`

  Gives the camera control back to the player

  ```js
  cutscene.stop();
  ```

### `explosion`

Creates an explosion

```js
explosion({
  team: Teams.crux,
  x: 5,
  y: 15,
  radius: 20,
  damage: 100,
  air: true,
  ground: true,
  pierce: true,
});
```

### `setRate`

Sets the speed of this world processor in instructions per tick.

```js
setRate(20);
```

### `fetch`

Contains the variants of the `fetch` instruction.

- #### `fetch.unit`

  Gets an unit from the given team
  The index starts at 0.

  ```js
  const count = fetch.unitCount(Teams.sharded);
  for (let i = 0; i < count; i++) {
    const unit = fetch.unit(Teams.sharded, i);
    print`x: ${unit.x}, y: ${unit.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.unitCount`

  Gets the amount of units existing on a given team.

  ```js
  const count = fetch.unitCount(Teams.sharded);
  for (let i = 0; i < count; i++) {
    const unit = fetch.unit(Teams.sharded, i);
    print`x: ${unit.x}, y: ${unit.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.player`

  Gets a player from a team.

  The index starts at 0.

  ```js
  const count = fetch.playerCount(Teams.sharded);
  for (let i = 0; i < count; i++) {
    const player = fetch.player(Teams.sharded, i);
    print`x: ${player.x}, y: ${player.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.playerCount`

  Gets the amount of players existing on a given team.

  ```js
  const count = fetch.playerCount(Teams.sharded);
  for (let i = 0; i < count; i++) {
    const player = fetch.player(Teams.sharded, i);
    print`x: ${player.x}, y: ${player.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.core`

  Gets a core from a team.

  The index of the starts at 0.

  ```js
  const count = fetch.coreCount(Teams.sharded);
  for (let i = 0; i < count; i++) {
    const core = fetch.core(Teams.sharded, i);
    print`x: ${core.x}, y: ${core.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.coreCount`

  Gets the amount of cores existing on a given team.

  ```js
  const count = fetch.coreCount(Teams.sharded);
  for (let i = 0; i < count; i++) {
    const core = fetch.core(Teams.sharded, i);
    print`x: ${core.x}, y: ${core.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.build`

  Gets a building from a team.

  The index starts at 0.

  ```js
  const count = fetch.buildCount(Teams.sharded, Blocks.router);
  for (let i = 0; i < count; i++) {
    const router = fetch.build(Teams.sharded, i, Blocks.router);
    print`x: ${router.x}, y: ${router.y}\n`;
  }
  printFlush();
  ```

- #### `fetch.buildCount`

  Gets the amount of buildings existing on a given team.

  ```js
  const count = fetch.buildCount(Teams.sharded, Blocks.router);
  for (let i = 0; i < count; i++) {
    const router = fetch.build(Teams.sharded, i, Blocks.router);
    print`x: ${router.x}, y: ${router.y}\n`;
  }
  printFlush();
  ```

### `getFlag`

Checks if a global flag is set.

```js
const flagEnabled = getFlag("foo");
```

### `setFlag`

Sets a global flag.

```js
setFlag("foo", true);
```

### `setProp`

Sets a property of a building or unit.

```js
const router = fetch.build(Teams.sharded, 0, Blocks.router);
setProp(LAccess.team, router, Teams.derelict);
```
