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

Appends the items to the global text buffer, calling this function
on its own will not print any contents to a message block.

To print the contents of the global text buffer and empty it, call `printFlush`.

::: command-example
:::

### `printChar`

Appends a character to the global text buffer using the provided UTF-16 code unit or the icon of the provided game content symbol.

::: command-example
:::

### `format`

Replaces the lowest-numbered `{placeholder}` in the global text buffer with the given value.

::: command-example
:::

### `draw`

Contains the multiple variants of the `draw` instruction

::: warning
Nothing is drawn until `drawFlush` is called.
:::

- #### `draw.clear`

  Fills the screen with a color.

  ::: command-example
  :::

- #### `draw.color`

  Sets the color for the next drawing operations.

  Each parameter must be within range: [0, 255].

  ::: command-example
  :::

- #### `draw.col`

  Sets the color for the next drawing operations.

  Uses compressed rgba data from `packColor`.

  ::: command-example
  :::

- #### `draw.stroke`

  Sets the width of the next lines to be drawn.

  ::: command-example
  :::

- #### `draw.line`

  Draws a line between two points.

  ::: command-example
  :::

- #### `draw.rect`

  Draws a filled rectangle.

  ::: command-example
  :::

- #### `draw.lineRect`

  Draws a rectangle outline.

  ::: command-example
  :::

- #### `draw.poly`

  Draws a filled, regular polygon.
  - `sides` - The number of sides the polygon should have
  - `radius` - The smallest distance between a line and the center of the polygon
  - `rotation` - The rotation of the polygon in degree

  ::: command-example
  :::

- #### `draw.linePoly`

  Draws the outline of a regular polygon.
  - `sides` - The number of sides the polygon should have
  - `radius` - The smallest distance between a line and the center of the polygon
  - `rotation` - The rotation of the polygon in degree

  ::: command-example
  :::

- #### `draw.triangle`

  Draws a filled triangle.

  ::: command-example
  :::

- #### `draw.image`

  Draws an image of the respective content. (like `Units.dagger` and `Blocks.router`)
  - `image` - The symbol for the image to be drawn.
  - `rotation` - The rotation of the image in degrees.

  ::: command-example
  :::

## Block Control

### `printFlush`

Writes the contents of the global text buffer into the target message
and clears the buffer afterwards.

- `target` The message building to write to. Writes to `message1` by default.

  Note that the default value only applies if you don't pass any parameter to this function.

  If `target` is `undefined`, the contents of the global text buffer will be
  discarded.

::: command-example
:::

### `drawFlush`

Writes the contents of the draw buffer into the target display
and clears the buffer afterwards.

- `target` The display building to write to. Writes to `display1` by default.

  Note that the default value only applies if you don't pass any parameter to this function.

::: command-example
:::

### `getLink`

Gets a block link by its index.

To make safe queries it is recommended to check an index
before trying to get a link. This can be done by using `Vars.links`.

::: command-example
:::

### `control`

Contains the multiple variants of the `control` instruction

- #### `control.enabled`

  Sets whether the building is enabled or disabled.

  ::: command-example
  :::

- #### `control.shoot`

  Makes the building shoot or aim at the given position
  - `building` - The shooting building
  - `shoot` - `true` to shoot, `false` to just aim at the position

  ::: command-example
  :::

- #### `control.shootp`

  Shoot at an unit with velocity prediction
  - `building` - The shooting building
  - `unit` - The target unit
  - `shoot` - `true` to shoot, `false` to just aim

  ::: command-example
  :::

- #### `control.config`

  Sets the config of a block (like the item of a sorter).

  In privileged (world) processors, `control.config` can also be used to:
  - Configure which block is linked to a mass driver (`control.config(driver1, driver2)`).
  - Configure which block is linked to a bridge conveyor/conduit (`control.config(bridge1, bridge2)`).
  - Toggle whether a block is connected to a power node (`control.config(node1, building)`).

  ::: command-example
  :::

- #### `control.color`

  Sets the color of an illuminator.

  ::: command-example
  :::

### `radar`

Detects an unit nearby this `building`.

- `building` - The building used to detect potential targets
- `filters` - The filters for selecting a target. Use "any" for any target.
- `order` - `true` to get the first result, `false` to get the last result.
- `sort` - The method on which the results should be sorted

Example:

::: command-example
:::

### `sensor`

Alternate way to access special properties on objects.

This method allows you to use customly created symbols
and sensor them on buildings, units, and bullets.

- `property` - The property or building to be sensed on the target
- `target` - The object that will be "sensed"

In privileged (world) processors, `sensor` can also query if a block is linked to a mass driver, bridge, or power node:

```js
const { driver1, driver2, node1, factory1 } = getBuildings();

// Senses if driver2 is linked to driver1
const isDriverLinked = sensor(driver2, driver1);

// Senses if factory1 is connected to power node node1
const isPowerLinked = sensor(factory1, node1);
```

::: tip Privileged Camera Properties
Camera viewport properties (`cameraX`, `cameraY`, `cameraWidth`, and `cameraHeight`) can be accessed directly on units (e.g. `unit.cameraX`) or sensed via `sensor(LAccess.cameraX, unit)`.

In Mindustry, these properties are privileged: they only return coordinate values when executing in privileged (world) processors; in standard processors, they evaluate to `null`.
:::

::: code-group

```ts [script.ts]
const { container1 } = getBuildings();

// problably defined by a mod
const myCustomSymbol = getVar<symbol>("@custom-symbol");
const result = sensor(myCustomSymbol, container1);
```

```js [script.js]
const { container1 } = getBuildings();

/** Probably defined by a mod @type {symbol} */
const myCustomSymbol = getVar("@custom-symbol");
const result = sensor(myCustomSymbol, container1);
```

:::

## Operations

### `lookup`

Looks up content symbols by their index.

For the inverse of this operation, you can sense the `id` of a symbol:

::: command-example
:::

- #### `lookup.block`

  Looks up a block symbol by it's index on the content registry.

  Use `Vars.blockCount` to check the maximum index allowed.

  ::: command-example
  :::

- #### `lookup.unit`

  Looks up an unit symbol by it's index on the content registry.

  Use `Vars.unitCount` to check the maximum index allowed.

  ::: command-example
  :::

- #### `lookup.item`

  Looks up an item symbol by it's index on the content registry.

  Use `Vars.itemCount` to check the maximum index allowed.

  ::: command-example
  :::

- #### `lookup.liquid`

  Looks up a liquid symbol by it's index on the content registry.

  Use `Vars.liquidCount` to check the maximum index allowed.

  ::: command-example
  :::

### `packColor`

Packs RGBA color information into a single number.

Each paremeter must range from `0` to `1`.

::: command-example
:::

### `unpackColor`

Unpacks RGBA color information from a packed color number into an object with `r`, `g`, `b`, and `a` components (each ranging from `0` to `1`).

::: command-example
:::

## Flow control

### `wait`

Stops the execution for the given amount of seconds

::: command-example
:::

### `endScript`

Jumps to the top of the instruction stack

::: command-example
:::

### `stopScript`

Halts the execution of this processor. Can be used to debug code and analyze the processor registers.

::: command-example
:::

## Unit control

### `unitBind`

Binds an unit to the this processor. The unit is accessible at `Vars.unit`.

If an unit symbol is received, the processor will pick an
unit of the given type.

If an unit object is received, the processor will bind to the unit.

::: command-example
:::

### `unitControl`

Controls the unit bound to the processor

- #### `unitControl.idle`

  Makes the unit bound to this processor stop moving but
  allows it to keep doing it's action (like mining or building).

  ::: command-example
  :::

- #### `unitControl.stop`

  Makes the unit bound to this processor stop mining, building and moving

  ::: command-example
  :::

- #### `unitControl.move`

  Makes the unit bound to this processor move to the given position

  ::: command-example
  :::

- #### `unitControl.approach`

  Makes the unit bound to this processor approach the given position at the given radius
  - `radius` - How distant to the position the unit can be

  ::: command-example
  :::

- #### `unitControl.pathfind`

  Makes the unit bound to this processor move to the given location.

  Uses the unit's pathfinding algorithm to decide how to
  reach the desired location instead of blidly going in a straight line.

  ::: command-example
  :::

- #### `unitControl.autoPathfind`

  Makes the unit bound to this processor automatically pathfind to the
  nearest enemy core or drop point.

  Is the same as standard wave enemy pathfinding.

  ::: command-example
  :::

- #### `unitControl.boost`

  Whether the unit bound to this processor should be boosted (floating).

  ::: command-example
  :::

- #### `unitControl.target`

  Makes the unit bound to this processor shoot/aim at the given position
  - `shoot` - `true` to shoot, `false` to just aim

  ::: command-example
  :::

- #### `unitControl.targetp`

  Makes the unit bound to this processor target an unit with velocity prediction
  - `unit` - The shoot target
  - `shoot` - `true` to shoot, `false` to just aim

  ::: command-example
  :::

- #### `unitControl.itemDrop`

  Makes the unit bound to this processor drop it's held items onto the given target

  Using this command sets the unit's action timeout.

  This command will be on cooldown for 1.5 seconds after the timeout has been set.
  - `target` - Where to drop the items, if `Blocks.air`, the unit will throw it's items away
  - `amount` - How many items should be dropped

  ::: command-example
  :::

- #### `unitControl.itemTake`

  Makes the unit bound to this processor take items from a building

  Using this command sets the unit's action timeout.

  This command will be on cooldown for 1.5 seconds after the timeout has been set.
  - `target` - The building that will have it's items taken
  - `item` - The kind of item to take
  - `amount` - How many items should be taken

  ::: command-example
  :::

- #### `unitControl.payDrop`

  Makes the unit bound to this processor drop one entity from it's payload

  Using this command sets the unit's action timeout.

  This command will be on cooldown for 1.5 seconds after the timeout has been set.

  ::: command-example
  :::

- #### `unitControl.payTake`

  Makes the unit bound to this processor take an entity into it's payload

  Using this command sets the unit's action timeout.

  This command will be on cooldown for 1.5 seconds after the timeout has been set.
  - `takeUnits` - Whether to take units or buildings

  ::: command-example
  :::

- #### `unitControl.payEnter`

  Makes the unit bound to this processor enter/land on the
  payload block the unit is on

  ::: command-example
  :::

- #### `unitControl.mine`

  Makes the unit bound to this processor mine at the given position

  ::: command-example
  :::

- #### `unitControl.flag`

  Sets the numeric flag of the unit bound to this processor

  ::: command-example
  :::

- #### `unitControl.build`

  Makes the unit bound to this processor build a building with the
  given properties
  - `block` - The kind of building to build
  - `rotation` - The rotation of the building, ranges from 0 to 3
  - `config` - The configuration value to use, or a building from which the configuration value will be copied.

  ::: command-example
  :::

- #### `unitControl.deconstruct`

  Makes the unit bound to this processor deconstruct a building at the given position

  ::: command-example
  :::

- #### `unitControl.getBlock`

  Makes the unit bound to this processor get data about a block at the given position

  ::: command-example
  :::

- #### `unitControl.within`

  Checks if the unit bound to this processor is within a radius of a given position.

  ::: command-example
  :::

- #### `unitControl.unbind`

  Resets the AI of the unit.

  Calling `unbind` does not actually unbind the unit from the processor,
  it just makes the unit resume its natural behavior.

  ::: command-example
  :::

### `unitRadar`

Finds an unit near the unit bound to this processor

- `filters` - The filters for selecting a target. Use "any" for any target.
- `order` - `true` to get the first result, `false` to get the last result.
- `sort` - The method on which the results should be sorted

Example:

::: command-example
:::

### `unitLocate`

Uses the unit bound to this processor to find specific types of blocks

- #### `unitLocate.ore`

  Uses the unit bound to this processor to find an ore vein anywhere on the map
  - `ore` - The kind of item the ore should contain

  ::: command-example
  :::

- #### `unitLocate.building`

  Uses the unit bound to this processor to find a building anywhere on the map
  - `group` - The group that the building belongs to
  - `enemy` - Whether it should be an enemy building or an ally one

  ::: command-example
  :::

- #### `unitLocate.spawn`

  Uses the unit bound to this processor to find an enemy spawn anywhere on the map.

  Returns the enemy spawn point or its core, if it exists.

  ::: command-example
  :::

- #### `unitLocate.damaged`

  Uses the unit bound to this processor to find a damaged ally buildings anywhere on the map

  ::: command-example
  :::

## World

These commands are exclusive to world processors and will not work
on a regular processor. They must be imported from `mlogjs:world`.

```js
import { getBlock, setBlock } from "mlogjs:world";
```

### `getBlock`

Gets block data from the map.

- #### `getBlock.floor`

  Gets the floor type on the given location

  ::: command-example
  :::

- #### `getBlock.ore`

  Gets the ore type on the given location. `Blocks.air` if there is no ore

  ::: command-example
  :::

- #### `getBlock.block`

  Gets the block type on the give location. `Blocks.air` if there is no block.

  ::: command-example
  :::

- #### `getBlock.building`

  Gets the building on the given location. `undefined` if there is no building.

  ::: command-example
  :::

### `setBlock`

- #### `setBlock.floor`

  Sets the floor of the tile at the given location.

  ::: command-example
  :::

- #### `setBlock.ore`

  Sets the ore at the given location. Use `Blocks.air` to remove any ore.

  ::: command-example
  :::

- #### `setBlock.block`

  Sets the block at a given location, it can be a regular building or an environment block.

  ::: command-example
  :::

### `spawnUnit`

Spawns an unit at the given location.

- `rotation` - The initial rotation of the unit in degrees.

::: command-example
:::

### `applyStatus`

Contains the variants for the `applyStatus` instruction.

- #### `applyStatus.apply`

  Applies a status effect to the given unit.

  The only status effects that don't require a duration are `overdrive` and `boss`.

  ::: command-example
  :::

- #### `applyStatus.clear`

  Removes a status effect to the given unit.

  ::: command-example
  :::

### `spawnWave`

Spawns an enemy wave, can be used even if there is an already active wave.

::: command-example
:::

### `setRule`

Contains the multiple variants of the `setrule` instruction.

- #### `setRule.currentWaveTime`

  Sets the wave countdown in seconds.

  ::: command-example
  :::

- #### `setRule.waveTimer`

  Enables/disables the wave timer.

  ::: command-example
  :::

- #### `setRule.waves`

  Allows or prevents waves from spawning.

  ::: command-example
  :::

- #### `setRule.wave`

  Sets the current wave number.

  ::: command-example
  :::

- #### `setRule.waveSpacing`

  Sets the time between waves in seconds.

  ::: command-example
  :::

- #### `setRule.waveSending`

  Sets wether waves can be manually summoned by pressing the play button.

  ::: command-example
  :::

- #### `setRule.attackMode`

  Sets wether the gamemode is the attack mode

  ::: command-example
  :::

- #### `setRule.enemyCoreBuildRadius`

  Sets the radius of the no-build zone around enemy cores.

  ::: command-example
  :::

- #### `setRule.dropZoneRadius`

  Sets the radius around enemy wave drop zones.

  ::: command-example
  :::

- #### `setRule.unitCap`

  Sets the base unit cap.

  ::: command-example
  :::

- #### `setRule.mapArea`

  Sets the playable map area. Blocks that are out of the new bounds will be removed.

  ::: command-example
  :::

- #### `setRule.lighting`

  Sets wether ambient lighting is enabled

  ::: command-example
  :::

- #### `setRule.ambientLight`

  Sets the ambient light color.
  `packColor` can be used to get the RGBA data recevied by this function.

  ::: command-example
  :::

- #### `setRule.solarMultiplier`

  Sets the multiplier for the energy output of solar panels.

  ::: command-example
  :::

- #### `setRule.ban`

  Bans a block/unit type from the world.

  ::: command-example
  :::

- #### `setRule.unban`

  Removes the ban of a block/unit type in the world.

  ::: command-example
  :::

- #### `setRule.buildSpeed`

  Sets the build speed multiplier of a team.

  The multiplier will always be clamped between `0.001` and `50`.

  ::: command-example
  :::

- #### `setRule.unitHealth`

Sets the health multiplier for units on a given team. The multiplier cannot
have a value lower than `0.001`.

```js
setRule.unitHealth(Teams.sharded, 1.5);
```

- #### `setRule.unitBuildSpeed`

  Sets the speed multiplier for unit factories.

  The multiplier will always be clamped between `0` and `50`.

  ::: command-example
  :::

- #### `setRule.unitCost`

  Sets the build cost multiplier for constructing units.

  ::: command-example
  :::

- #### `setRule.unitDamage`

  Sets the damage multiplier for units on a given team.

  ::: command-example
  :::

- #### `setRule.blockHealth`

  Sets the block health multiplier for a given team.

  ::: command-example
  :::

- #### `setRule.blockDamage`

  Sets the block damage multiplier for a given team.
  Sets the multiplier of damaged dealt by blocks of a given team.

  ::: command-example
  :::

- #### `setRule.rtsMinWeight`

  Sets the Real Time Strategy minimum weight for a team.

  In other words, it sets the minimum "advantage" needed for a squad to attack.
  The higher the value, the more cautious the squad is.

  ::: command-example
  :::

- #### `setRule.rtsMinSquad`

  Sets the Real Time Strategy minimum size of attack squads of a team.

  The higher the value, the more units are required before a squad attacks.

  ::: command-example
  :::

### `flushMessage`

Writes the contents of the global text buffer in the selected mode
and clears the buffer afterwards.

::: command-example
:::

- #### `flushMessage.notify`

  Shows a nofication at the top of the screen.

  Returns whether the operation was executed successfully.

  ::: command-example
  :::

- #### `flushMessage.mission`

  Puts the content on the top left corner of the screen.

  Returns whether the operation was executed successfully.

  ::: command-example
  :::

- #### `flushMessage.announce`

  Puts the content on the middle of the screen.

  Returns whether the operation was executed successfully.
  - `duration` - The duration, in seconds

  ::: command-example
  :::

- #### `flushMessage.toast`

  Puts the content on the middle top of the screen.

  Returns whether the operation was executed successfully.
  - `duration` - The duration, in seconds

  ::: command-example
  :::

### `cutscene`

- #### `cutscene.pan`

  Moves the player's camera to the given location.

  ::: command-example
  :::

- #### `cutscene.zoom`

  Zooms the player camera to the desired level

  ::: command-example
  :::

- #### `cutscene.stop`

  Gives the camera control back to the player

  ::: command-example
  :::

### `explosion`

Creates an explosion

::: command-example
:::

### `setRate`

Sets the speed of this world processor in instructions per tick.

::: command-example
:::

### `fetch`

Contains the variants of the `fetch` instruction.

- #### `fetch.unit`

  Gets an unit from the given team
  The index starts at 0.
  - `type` - The type of unit to get. If not specified, returns units of any type.

  ::: command-example
  :::

- #### `fetch.unitCount`

  Gets the amount of units existing on a given team.
  - `type` - The type of unit to count.
    If `type` is not specified, returns the total amount of units

  ::: command-example
  :::

- #### `fetch.player`

  Gets a player from a team.

  The index starts at 0.

  ::: command-example
  :::

- #### `fetch.playerCount`

  Gets the amount of players existing on a given team.

  ::: command-example
  :::

- #### `fetch.core`

  Gets a core from a team.

  The index of the starts at 0.

  ::: command-example
  :::

- #### `fetch.coreCount`

  Gets the amount of cores existing on a given team.

  ::: command-example
  :::

- #### `fetch.build`

  Gets a building from a team.

  The index starts at 0.

  ::: command-example
  :::

- #### `fetch.buildCount`

  Gets the amount of buildings existing on a given team.
  - `type` - The type of building to count
    If `type` is not specified, returns the total amount of buildings.

  ::: command-example
  :::

### `getFlag`

Checks if a global flag is set.

::: command-example
:::

### `setFlag`

Sets a global flag.

::: command-example
:::

### `setProp`

Creates a writable record that allows you to set a property of a building, unit, or bullet.

Supports setting:

- **Units**: `x`, `y`, `health`, `shield`, `armor`, `speed`, `rotation`, `velocityX`, `velocityY`, `team`, `flag`, `payloadType`, `totalPower`, `bulletTime`, `bulletLifetime`.
- **Buildings**: `health`, `totalPower`, items, liquids.
- **Bullets**: `health`, `x`, `y`, `velocityX`, `velocityY`, `rotation`, `team`, `speed`, `bulletLifetime`, `bulletTime`.

::: command-example
:::

### `localePrint`

Add map locale property value to the global text buffer.

To set map locale bundles in map editor, check Map Info > Locale Bundles.

If client is a mobile device, tries to print a property ending in ".mobile"
first.

::: command-example
:::

### `playMusic`

Plays background music.

::: command-example
:::

### `spawnBullet`

Spawns a bullet with specified properties.

::: command-example
:::

### `query`

Queries entities in a circle or rectangle, populating the `@queries` variable.

- #### `query.circle`

  Queries entities within a circular radius.

  ::: command-example
  :::

- #### `query.rect`

  Queries entities within a rectangular area.

  ::: command-example
  :::

### `effect`

Emits visual and audio effects at given coordinates. Available in `mlogjs:world`.

```js
import { effect } from "mlogjs:world";

effect.warn(10, 20);
effect.explosion(50, 50, 5);
effect.trail({ x: 30, y: 30, color: packColor(1, 0, 0, 1), size: 2 });
```

### `playSound`

Plays a sound effect either globally or at specific coordinates. Available in `mlogjs:world`.

- #### `playSound.positional`

  Plays a positional sound.

  ```js
  import { playSound } from "mlogjs:world";

  playSound.positional({
    sound: Sounds.pew,
    x: 10,
    y: 20,
    volume: 1,
    pitch: 1,
  });
  ```

- #### `playSound.global`

  Plays a sound globally.

  ```js
  import { playSound } from "mlogjs:world";

  playSound.global({
    sound: Sounds.artillery,
    volume: 1,
    pitch: 1,
  });
  ```

### `senseWeather`

Checks whether a weather effect is currently active on the map. Available in `mlogjs:world`.

```js
import { senseWeather } from "mlogjs:world";

const isRaining = senseWeather(Weathers.rain);
print`Raining: ${isRaining}`;
printFlush();
```

### `setWeather`

Enables or disables a weather effect on the map. Available in `mlogjs:world`.

```js
import { setWeather } from "mlogjs:world";

setWeather(Weathers.rain, true);
```

### `SyncLock`

Helper class for server-to-client variable synchronization (emits the `sync` instruction). Available in `mlogjs:world`.

```js
import { SyncLock } from "mlogjs:world";

const lock = new SyncLock(100);
lock.value = 200;
lock.sendToClients();
```

### `Marker`

Allows creating and manipulating world and minimap markers. Available in `mlogjs:world`.

```js
import { Marker } from "mlogjs:world";

// create a shape marker
const m = Marker.shape({ id: 1, x: 50, y: 50, replace: true });
m.color = packColor(1, 0, 0, 1);
m.radius = 10;
m.world = true;

// access an existing marker
const existing = Marker.of(1);
existing.radius = 15;
```
