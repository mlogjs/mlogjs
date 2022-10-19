# Commands

Commands are built in function macros that expand into instructions during compilation.

Here is a list of them, some have multiple overloads

Overloaded commands have the following syntax:

```js
command.variant();
```

## Input/output

- `print` - Adds data to the print buffer
- `draw` - Adds data to the draw buffer

## Block Control

- `printFlush` - Empties the buffer and prints its contents on the target message block
- `drawFlush` - Empties the draw buffer and draws its contents on the target display block
- `getLink` - Gets a block linked to the processor via its index
- `control` - Controls a given block
- `radar` - Uses a block (usually a turret) to detect units nearby
- `sensor` - Detect properties of values (only use if you know what you are doing)

## Operations

- `lookup` - Finds a symbol for a kind of content based on its index
- `packColor` - Packs RGBA color information into a single number

## Flow control

- `wait` - Pauses execution for the given amount of seconds
- `endScript` - Jumps to the top of the instruction stack (compiles into an `end` instruction)
- `stopScript` - Halts the execution of the current processor

## Unit control

- `unitBind` - Binds an unit of a given type to the processor
- `unitControl` - Controls the unit bound to the processor
- `unitRadar` - Uses the unit bound to the processor to find nearby units
- `unitLocate` - Uses the unit bound to the processor to find blocks

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
