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

Writes the contents of the print buffer into the target message
and clears the buffer afterwards.

- `target` The message building to write to. Writes to `message1` by default.

  Note that the default value only applies if you don't pass any parameter to this function.

  If `target` is `undefined`, the contents of the print buffer will be
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

  Sets the config of a block (like the item of a sorter)

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
and sensor them on buildings.

- `property` - The property to be sensed on the building
- `target` - The object that will be "sensed"

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

  - `target` - Where to drop the items, if `Blocks.air`, the unit will throw it's items away
  - `amount` - How many items should be dropped

  ::: command-example
  :::

- #### `unitControl.itemTake`

  Makes the unit bound to this processor take items from a building

  - `target` - The building that will have it's items taken
  - `item` - The kind of item to take
  - `amount` - How many items should be taken

  ::: command-example
  :::

- #### `unitControl.payDrop`

  Makes the unit bound to this processor drop one entity from it's payload

  ::: command-example
  :::

- #### `unitControl.payTake`

  Makes the unit bound to this processor take an entity into it's payload

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
  - `config` - The config of the building

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

Writes the contents of the print buffer in the selected mode
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

  ::: command-example
  :::

- #### `fetch.unitCount`

  Gets the amount of units existing on a given team.

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

Creates a writable record that allows you to set a property of a building or unit.

::: command-example
:::

### `localePrint`

Add map locale property value to the print buffer.

To set map locale bundles in map editor, check Map Info > Locale Bundles.

If client is a mobile device, tries to print a property ending in ".mobile"
first.

::: command-example
:::
