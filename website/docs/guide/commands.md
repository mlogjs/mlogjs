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
