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
