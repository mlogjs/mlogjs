import "./kind";
import {
  TDrawPrintAlign,
  TRadarFilter,
  TRadarSort,
  TUnitLocateBuildingGroup,
} from "./util";
declare global {
  /**
   * Appends the items to the print buffer, calling this function on its own
   * will not print any contents to a message block.
   *
   * To print the contents of the print buffer and empty it call, `printFlush`.
   *
   * @param items The items to be added to the print buffer.
   *
   *   ```js
   *   const a = Math.floor(Math.rand(10));
   *   const b = Math.floor(Math.rand(10));
   *
   *   // call normally
   *   print("a + b = ", a, " + ", b, " = ", a + b, "\n");
   *
   *   // call with tagged string templates
   *   print`a + b = ${a} + ${b} = ${a + b}\n`;
   *
   *   printFlush();
   *   ```
   */
  function print(...items: unknown[]): void;

  /** Contains the multiple variants of the `draw` instruction */
  namespace draw {
    /**
     * Fills the screen with a color.
     *
     * ```js
     * draw.clear(0, 0, 0); // black screen
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function clear(r: number, g: number, b: number): void;
    /**
     * Sets the color for the next drawing operations.
     *
     * Each parameter must be within range: [0, 255].
     *
     * ```js
     * draw.color(255, 255, 255, 128);
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function color(r: number, g: number, b: number, a?: number): void;

    /**
     * Sets the color for the next drawing operations.
     *
     * Uses compressed rgba data from `packColor`.
     *
     * ```js
     * draw.col(packColor(1, 1, 1, 1));
     * ```
     */
    function col(rgbaData: number): void;

    /**
     * Sets the width of the next lines to be drawn.
     *
     * ```js
     * draw.stroke(15);
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function stroke(width: number): void;

    /**
     * Draws a line between two points.
     *
     * ```js
     * draw.line({ x: 5, y: 5, x2: 50, y2: 50 });
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function line(options: {
      x: number;
      y: number;
      x2: number;
      y2: number;
    }): void;

    /**
     * Draws a filled rectangle.
     *
     * ```js
     * draw.rect({
     *   x: 10,
     *   y: 15,
     *   height: 60,
     *   width: 40,
     * });
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function rect(options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;

    /**
     * Draws a rectangle outline.
     *
     * ```js
     * draw.lineRect({
     *   x: 10,
     *   y: 15,
     *   height: 60,
     *   width: 40,
     * });
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function lineRect(options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;

    /**
     * Draws a filled, regular polygon.
     *
     * @param options.sides The number of sides the polygon should have
     * @param options.radius The smallest distance between a line and the center
     *   of the polygon
     * @param options.rotation The rotation of the polygon in degrees
     *
     *   ```js
     *   draw.poly({
     *     radius: 10,
     *     rotation: 0,
     *     sides: 10,
     *     x: 25,
     *     y: 25,
     *   });
     *   ```
     *
     *   Warning: nothing is drawn until `drawFlush` is called.
     */
    function poly(options: {
      x: number;
      y: number;
      /** The number of sides the polygon should have */
      sides: number;
      /** The smallest distance between a line and the center of the polygon */
      radius: number;
      /** The rotation of the polygon in degrees */
      rotation: number;
    }): void;

    /**
     * Draws the outline of a regular polygon.
     *
     * @param options.sides The number of sides the polygon should have
     * @param options.radius The smallest distance between a line and the center
     *   of the polygon
     * @param options.rotation The rotation of the polygon in degrees
     *
     *   ```js
     *   draw.linePoly({
     *     radius: 10,
     *     rotation: 0,
     *     sides: 10,
     *     x: 25,
     *     y: 25,
     *   });
     *   ```
     *
     *   Warning: nothing is drawn until `drawFlush` is called.
     */
    function linePoly(options: {
      x: number;
      y: number;
      /** The number of sides the polygon should have */
      sides: number;
      /** The smallest distance between a line and the center of the polygon */
      radius: number;
      /** The rotation of the polygon in degrees */
      rotation: number;
    }): void;

    /**
     * Draws a filled triangle.
     *
     * ```js
     * draw.triangle({
     *   x: 10,
     *   y: 10,
     *   x2: 20,
     *   y2: 20,
     *   x3: 30,
     *   y3: 10,
     * });
     * ```
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function triangle(options: {
      x: number;
      y: number;
      x2: number;
      y2: number;
      x3: number;
      y3: number;
    }): void;

    /**
     * Draws an image of the respective content. (like `Units.dagger` and
     * `Blocks.router`)
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     *
     * @param options.image The symbol for the image to be drawn.
     * @param options.rotation The rotation of the image in degrees.
     *
     *   Example:
     *
     *   ```js
     *   // draw a router
     *   draw.image({
     *     x: 30,
     *     y: 30,
     *     image: Blocks.router,
     *     size: 15,
     *     rotation: 0,
     *   });
     *
     *   // draw the unit bound to the processor
     *   draw.image({
     *     x: 60,
     *     y: 60,
     *     image: Vars.unit.type,
     *     size: 15,
     *     rotation: 0,
     *   });
     *   ```
     */
    function image(options: {
      x: number;
      y: number;
      /** The symbol for the image to be drawn. */
      image: symbol;
      size: number;
      /** The rotation of the image in degrees. */
      rotation: number;
    }): void;

    /**
     * Draws text from the print buffer, clearing it afterwards.
     *
     * Only ASCII characters are supported.
     */
    function print(options: {
      x: number;
      y: number;
      align: TDrawPrintAlign;
    }): void;
  }

  /**
   * Writes the contents of the print buffer into the target message and clears
   * the buffer afterwards.
   *
   * @param target The message building to write to. Writes to `message1` by
   *   default.
   *
   *   Note that the default value only applies if you don't pass any parameter to
   *   this function.
   *
   *   If `target` is `undefined`, the contents of the print buffer will be
   *   discarded.
   *
   *   ```js
   *   const { message2 } = getBuildings();
   *   printFlush(message2);
   *
   *   printFlush(); // defaults to message1
   *   ```
   */
  function printFlush(target: BasicBuilding | undefined): void;
  function printFlush(): void;

  /**
   * Writes the contents of the draw buffer into the target display and clears
   * the buffer afterwards.
   *
   * @param target The display building to write to. Writes to `display1` by
   *   default.
   *
   *   Note that the default value only applies if you don't pass any parameter to
   *   this function.
   *
   *   ```js
   *   const { display2 } = getBuildings();
   *   printFlush(display2);
   *
   *   printFlush(); // defaults to display1
   *   ```
   */
  function drawFlush(target: BasicBuilding): void;
  function drawFlush(): void;

  /**
   * Gets a block link by its index.
   *
   * To make safe queries it is recommended to check an index before trying to
   * get a link. This can be done by using `Vars.links`.
   *
   * Example:
   *
   * ```js
   * for (let i = 0; i < Vars.links; i++) {
   *   const building = getLink(i);
   *   const { x, y } = building;
   *   print`${building}: (${x}, ${y})\n`;
   * }
   *
   * printFlush();
   * ```
   */
  function getLink<T extends BasicBuilding = AnyBuilding>(index: number): T;

  /** Contains the multiple variants of the `control` instruction */
  namespace control {
    /**
     * Sets whether the building is enabled or disabled.
     *
     * ```js
     * const { conveyor1 } = getBuildings();
     *
     * control.enabled(conveyor1, false);
     * ```
     */
    function enabled(building: BasicBuilding, value: boolean): void;

    /**
     * Makes the building shoot or aim at the given position
     *
     * @param options.building The shooting building
     * @param options.shoot `true` to shoot, `false` to just aim at the position
     *
     *   ```js
     *   const { cyclone1 } = getBuildings();
     *
     *   control.shoot({
     *     building: cyclone1,
     *     shoot: true,
     *     x: Vars.thisx,
     *     y: Vars.thisy,
     *   });
     *   ```
     */
    function shoot(options: {
      /** The shooting building */
      building: BasicBuilding & Shooting;
      x: number;
      y: number;
      /** `true` to shoot, `false` to just aim at the position */
      shoot: boolean;
    }): void;

    /**
     * Shoot at an unit with velocity prediction
     *
     * @param options.building The shooting building
     * @param options.unit The target unit
     * @param options.shoot `true` to shoot, `false` to just aim
     *
     *   ```js
     *   const { cyclone1 } = getBuildings();
     *
     *   const player = radar({
     *     building: cyclone1,
     *     filters: ["player", "any", "any"],
     *     order: true,
     *     sort: "distance",
     *   });
     *
     *   control.shootp({
     *     building: cyclone1,
     *     unit: player,
     *     shoot: true,
     *   });
     *   ```
     */
    function shootp(options: {
      /** The shooting building */
      building: BasicBuilding & Shooting;
      /** The target unit */
      unit: BasicUnit;
      /** `true` to shoot, `false` to just aim */
      shoot: boolean;
    }): void;

    /**
     * Sets the config of a block (like the item of a sorter)
     *
     * ```js
     * const { sorter1 } = getBuildings();
     *
     * control.config(sorter1, Items.copper);
     * ```
     */
    function config(building: BasicBuilding, value: symbol): void;

    /**
     * Sets the color of an illuminator.
     *
     * ```js
     * const { illuminator1 } = getBuildings();
     *
     * control.color(illuminator1, packColor(0.2, 0.65, 1, 1));
     * ```
     */
    function color(building: BasicBuilding, rgbaData: number): void;
  }

  /**
   * Detects an unit nearby this `building`.
   *
   * @param options.building The building used to detect potential targets
   * @param options.filters The filters for selecting a target. Use "any" for
   *   any target.
   * @param options.order `true` to get the first result, `false` to get the
   *   last result.
   * @param options.sort The method on which the results should be sorted
   *
   *   Example:
   *
   *   ```js
   *   const { cyclone1 } = getBuildings();
   *
   *   // returns the furthest enemy unit
   *   const result = radar({
   *     building: cyclone1,
   *     filters: ["enemy", "any", "any"],
   *     order: false,
   *     sort: "distance",
   *   });
   *   ```
   */
  function radar<T extends BasicUnit = AnyUnit>(options: {
    /** The building used to detect potential targets */
    building: BasicBuilding;
    /** The filters for selecting a target. Use "any" for any target. */
    filters: [TRadarFilter, TRadarFilter, TRadarFilter];
    /** `true` to get the first result, `false` to get the last result. */
    order: boolean;
    /** The method on which the results should be sorted */
    sort: TRadarSort;
  }): T;

  /**
   * Alternate way to access special properties on objects.
   *
   * This method allows you to use customly created symbols and sensor them on
   * buildings.
   *
   * @param property The property to be sensed on the building
   * @param target The object that will be "sensed"
   *
   *   Example:
   *
   *   ```ts
   *   const myBuilding = getBuilding("container1");
   *
   *   // typescript annotation, you can use jsdoc comments on
   *   // regular javascript
   *   const myCustomSymbol = getVar<symbol>("@custom-symbol"); // problably defined by a mod
   *   const result = sensor(myCustomSymbol, myBuilding);
   *   ```
   */
  function sensor<T>(property: symbol, target: BasicBuilding | BasicUnit): T;

  /**
   * Stops the execution for the given amount of seconds
   *
   * ```js
   * print("before");
   * printFlush();
   * wait(3.5);
   * print("after");
   * printFlush();
   * ```
   */
  function wait(seconds: number): void;

  /**
   * Looks up content symbols by their index.
   *
   * For the inverse of this operation, you can sense the `id` of a symbol:
   *
   * ```js
   * const { type } = getLink(0);
   *
   * print(type === lookup.block(type.id));
   * printFlush(); // prints "1"
   * ```
   */
  namespace lookup {
    /**
     * Looks up a block symbol by it's index on the content registry.
     *
     * Use `Vars.blockCount` to check the maximum index allowed.
     *
     * Example:
     *
     * ```js
     * const first = lookup.block(0);
     * const last = lookup.block(Vars.blockCount - 1);
     *
     * print`
     * first block type: ${first}
     * last block type: ${last}`;
     *
     * printFlush();
     * ```
     */
    function block(index: number): BlockSymbol | undefined;

    /**
     * Looks up an unit symbol by it's index on the content registry.
     *
     * `index` must an integer that satisfies the following range `index <
     * Vars.unitCount`
     *
     * Example:
     *
     * ```js
     * const first = lookup.unit(0);
     * const last = lookup.unit(Vars.unitCount - 1);
     *
     * print`
     * first unit type: ${first}
     * last unit type: ${last}`;
     *
     * printFlush();
     * ```
     */
    function unit(index: number): UnitSymbol | undefined;

    /**
     * Looks up an item symbol by it's index on the content registry.
     *
     * Use `Vars.itemCount` to check the maximum index allowed.
     *
     * Example:
     *
     * ```js
     * const first = lookup.item(0);
     * const last = lookup.item(Vars.itemCount - 1);
     *
     * print`
     * first item type: ${first}
     * last item type: ${last}`;
     *
     * printFlush();
     * ```
     */
    function item(index: number): ItemSymbol | undefined;

    /**
     * Looks up a liquid symbol by it's index on the content registry.
     *
     * Use `Vars.liquidCount` to check the maximum index allowed.
     *
     * Example:
     *
     * ```js
     * const first = lookup.liquid(0);
     * const last = lookup.liquid(Vars.liquidCount - 1);
     *
     * print`
     * first liquid type: ${first}
     * last liquid type: ${last}`;
     *
     * printFlush();
     * ```
     */
    function liquid(index: number): LiquidSymbol | undefined;
  }

  /**
   * Packs RGBA color information into a single number.
   *
   * Each paremeter must range from `0` to `1`.
   *
   * ```js
   * const colorData = packColor(0.1, 0.6, 0.8, 0.1);
   *
   * // world processor only
   * // sets the color of the ambient light
   * setRule.ambientLight(colorData);
   *
   * // set color of illuminator
   * const { illuminator1 } = getBuildings();
   * control.color(illuminator1, packColor(0.2, 0.65, 1, 1));
   * ```
   */
  function packColor(r: number, g: number, b: number, a: number): number;

  /**
   * Binds an unit to the this processor. The unit is accessible at `Vars.unit`.
   *
   * If an unit symbol is received, the processor will pick an unit of the given
   * type.
   *
   * If an unit object is received, the processor will bind to the unit.
   *
   * ```js
   * unitBind(Units.flare);
   *
   * const { x, y } = Vars.unit;
   *
   * print`x: ${x} y: ${y}`;
   * printFlush();
   * ```
   */
  function unitBind(unit: UnitSymbol | BasicUnit): void;

  namespace unitControl {
    /**
     * Makes the unit bound to this processor stop moving but allows it to keep
     * doing it's action (like mining or building)
     *
     * ```js
     * unitControl.idle();
     * ```
     */
    function idle(): void;

    /**
     * Makes the unit bound to this processor stop mining, building and moving
     *
     * ```js
     * unitControl.stop();
     * ```
     */
    function stop(): void;

    /**
     * Makes the unit bound to this processor move to the given position.
     *
     * The unit tends to move in a straight line to the target location, which
     * doesn't work in situations where the unit encounters an obstacle (such as
     * a dagger trying to get past a wall).
     *
     * For those scenarios it's better to use `unitControl.pathfind`.
     *
     * ```js
     * unitControl.move(10, 20);
     * ```
     */
    function move(x: number, y: number): void;

    /**
     * Makes the unit bound to this processor approach the given position at the
     * given radius
     *
     * @param options.radius How distant to the position the unit can be
     *
     *   ```js
     *   unitControl.approach({
     *     x: 15,
     *     y: 30,
     *     radius: 5,
     *   });
     *   ```
     */
    function approach(options: {
      x: number;
      y: number;
      /** How distant to the position the unit can be */
      radius: number;
    }): void;

    /**
     * Makes the unit bound to this processor move to the given location.
     *
     * Uses the unit's pathfinding algorithm to decide how to reach the desired
     * location instead of blidly going in a straight line.
     *
     * ```js
     * // makes flares follow the player's cursor
     * const { foreshadow1 } = getBuildings();
     *
     * const player = radar({
     *   building: foreshadow1,
     *   filters: ["player", "any", "any"],
     *   order: true,
     *   sort: "distance",
     * });
     *
     * unitBind(Units.flare);
     *
     * unitControl.pathfind(player.shootX, player.shootY);
     * ```
     */
    function pathfind(x: number, y: number): void;

    /**
     * Makes the unit bound to this processor automatically pathfind to the
     * nearest enemy core or drop point.
     *
     * Is the same as standard wave enemy pathfinding.
     *
     * ```js
     * unitControl.autoPathfind();
     * ```
     */
    function autoPathfind(): void;

    /**
     * Whether the unit bound to this processor should be boosted (floating)
     *
     * ```js
     * unitControl.boost(true);
     * ```
     */
    function boost(enable: boolean): void;

    /**
     * Makes the unit bound to this processor shoot/aim at the given position
     *
     * @param options.shoot `true` to shoot, `false` to just aim
     *
     *   ```js
     *   unitControl.target({
     *     x: 15,
     *     y: 30,
     *     shoot: true,
     *   });
     *   ```
     */
    function target(options: {
      x: number;
      y: number;
      /** `true` to shoot, `false` to just aim */
      shoot: boolean;
    }): void;

    /**
     * Makes the unit bound to this processor target an unit with velocity
     * prediction
     *
     * @param options.unit The shoot target
     * @param options.shoot `true` to shoot, `false` to just aim
     *
     *   ```js
     *   unitBind(Units.flare);
     *
     *   const player = unitRadar({
     *     filters: ["player", "any", "any"],
     *     order: true,
     *     sort: "distance",
     *   });
     *
     *   unitControl.targetp({
     *     unit: player,
     *     shoot: true,
     *   });
     *   ```
     */
    function targetp(options: {
      /** The shoot target */
      unit: BasicUnit;
      /** `true` to shoot, `false` to just aim */
      shoot: boolean;
    }): void;

    /**
     * Makes the unit bound to this processor drop it's held items onto the
     * given target
     *
     * @param target Where to drop the items, if `Blocks.air`, the unit will
     *   throw it's items away
     * @param amount How many items should be dropped
     *
     *   ```js
     *   const { container1 } = getBuildings();
     *
     *   // ...
     *
     *   // drop 40 items on the container
     *   unitControl.itemDrop(container1, 40);
     *
     *   // ...
     *
     *   // discard 10 items from the current unit
     *   unitControl.itemDrop(Blocks.air, 10);
     *   ```
     */
    function itemDrop(
      target: BasicBuilding | typeof Blocks.air,
      amount: number,
    ): void;

    /**
     * Makes the unit bound to this processor take items from a building
     *
     * @param target The building that will have it's items taken
     * @param item The kind of item to take
     * @param amount How many items should be taken
     *
     *   ```js
     *   const { vault1 } = getBuildings();
     *
     *   // bind unit and move to the valult...
     *
     *   unitControl.itemTake(vault1, Items.graphite, 50);
     *
     *   // do something with the graphite...
     *   ```
     */
    function itemTake(
      target: BasicBuilding,
      item: ItemSymbol,
      amount: number,
    ): void;

    /**
     * Makes the unit bound to this processor drop one entity from it's payload
     *
     * ```js
     * unitControl.payDrop();
     * ```
     */
    function payDrop(): void;

    /**
     * Makes the unit bound to this processor take an entity into it's payload
     *
     * @param options.takeUnits Whether to take units or buildings
     *
     *   ```js
     *   unitControl.payTake({
     *     takeUnits: true,
     *   });
     *   ```
     */
    function payTake(options: {
      /** Whether to take units or buildings */
      takeUnits: boolean;
    }): void;

    /**
     * Makes the unit bound to this processor enter/land on the payload block
     * the unit is on
     *
     * ```js
     * unitControl.payEnter();
     * ```
     */
    function payEnter(): void;

    /**
     * Makes the unit bound to this processor mine at the given position
     *
     * ```js
     * unitControl.mine(10, 20);
     * ```
     */
    function mine(x: number, y: number): void;

    /**
     * Sets the numeric flag of the unit bound to this processor
     *
     * ```js
     * // a unique id based on the coordinates of this processor
     * const processorId = Vars.thisx * Vars.mapw + Vars.thisy;
     *
     * unitControl.flag(processorId);
     * ```
     */
    function flag(value: number): void;

    /**
     * Makes the unit bound to this processor build a building with the given
     * properties
     *
     * @param options.block The kind of building to build
     * @param options.rotation The rotation of the building, ranges from 0 to 3
     * @param options.config The config of the building
     *
     *   ```js
     *   unitControl.build({
     *     x: 10,
     *     y: 20,
     *     block: Blocks.sorter,
     *     rotation: 1,
     *     config: Items.silicon,
     *   });
     *   ```
     */
    function build(options: {
      x: number;
      y: number;
      /** The kind of building to build */
      block: BuildingSymbol;
      /** The rotation of the building, ranges from 0 to 3 */
      rotation: number;
      /** The config of the building */
      config?: unknown;
    }): void;

    /**
     * Makes the unit bound to this processor get data about a block at the
     * given position.
     *
     * ```js
     * // prints info about the block the player is pointing at
     * unitBind(Units.flare);
     *
     * const player = unitRadar({
     *   filters: ["player", "any", "any"],
     *   sort: "distance",
     *   order: true,
     * });
     *
     * const { shootX, shootY } = player;
     * const [type, building, floor] = unitControl.getBlock(shootX, shootY);
     *
     * print`
     * block: ${type}
     * floor: ${floor}
     * size: ${building.size ?? 1}
     * `;
     * printFlush();
     * ```
     */
    function getBlock<T extends BasicBuilding = AnyBuilding>(
      x: number,
      y: number,
    ): [
      type: BlockSymbol | undefined,
      building: T | undefined,
      floor: EnvBlockSymbol | OreSymbol | undefined,
    ];

    /**
     * Checks if the unit bound to this processor is within a radius of a given
     * position.
     *
     * ```js
     * if (Vars.unit == undefined) {
     *   unitBind(Units.flare);
     * }
     *
     * const player = unitRadar({
     *   filters: ["player", "any", "any"],
     *   sort: "distance",
     *   order: true,
     * });
     *
     * const nearby = unitControl.within({
     *   x: player.x,
     *   y: player.y,
     *   radius: 5,
     * });
     *
     * print`nearby: ${nearby}`;
     * printFlush();
     * ```
     */
    function within(options: { x: number; y: number; radius: number }): boolean;

    /**
     * Resets the AI of the unit.
     *
     * Calling `unbind` does not actually unbind the unit from the processor, it
     * just makes the unit resume its natural behavior.
     *
     * ```js
     * unitControl.unbind();
     * ```
     */
    function unbind(): void;
  }

  /**
   * Finds an unit near the unit bound to this processor
   *
   * @param options.filters The filters for selecting a target. Use "any" for
   *   any target.
   * @param options.order `true` to get the first result, `false` to get the
   *   last result.
   * @param options.sort The method on which the results should be sorted
   *
   *   Example:
   *
   *   ```js
   *   // returns the furthest enemy unit
   *   const result = unitRadar({
   *     filters: ["enemy", "any", "any"],
   *     order: false,
   *     sort: "distance",
   *   });
   *   ```
   */
  function unitRadar<T extends BasicUnit = AnyUnit>(options: {
    /** The filters for selecting a target. Use "any" for any target. */
    filters: [TRadarFilter, TRadarFilter, TRadarFilter];
    /** `true` to get the first result, `false` to get the last result. */
    order: boolean;
    /** The method on which the results should be sorted */
    sort: TRadarSort;
  }): T;

  /** Uses the unit bound to this processor to find specific types of blocks */
  namespace unitLocate {
    /**
     * Uses the unit bound to this processor to find an ore vein anywhere on the
     * map
     *
     * @param ore The kind of item the ore should contain
     *
     *   ```js
     *   const [found, x, y] = unitLocate.ore(Items.copper);
     *
     *   if (found) {
     *     unitControl.approach({ x, y, radius: 5 });
     *   }
     *   ```
     */
    function ore(
      ore: ItemSymbol,
    ): [found: false] | [found: true, x: number, y: number];

    /**
     * Uses the unit bound to this processor to find a building anywhere on the
     * map
     *
     * @param options.group The group that the building belongs to
     * @param options.enemy Whether it should be an enemy building or an ally
     *   one
     *
     *   ```js
     *   const vault = getBuilding("vault1");
     *   const takeAmount = 100;
     *
     *   unitBind(Units.mega);
     *
     *   // we don't use the `found` variable
     *   // because we always have our own core
     *   const [, x, y, core] = unitLocate.building({
     *     group: "core",
     *     enemy: false,
     *   });
     *
     *   const location = {
     *     x,
     *     y,
     *     radius: 5,
     *   };
     *
     *   if (!unitControl.within(location) && Vars.unit.totalItems == 0) {
     *     // if the unit has no items and it is not near
     *     // the core, move it to the core
     *     // and take 100 copper
     *     unitControl.approach(location);
     *     unitControl.itemTake(core, Items.copper, takeAmount);
     *   } else {
     *     // else, approach the vault and drop the items on it
     *     unitControl.approach({
     *       x: vault.x,
     *       y: vault.y,
     *       radius: 5,
     *     });
     *     unitControl.itemDrop(vault, takeAmount);
     *   }
     *   ```
     */
    function building<T extends BasicBuilding = AnyBuilding>(options: {
      /** The group that the building belongs to */
      group: TUnitLocateBuildingGroup;
      /** Whether it should be an enemy building or an ally one */
      enemy: boolean;
    }): [found: false] | [found: true, x: number, y: number, building: T];

    /**
     * Uses the unit bound to this processor to find an enemy spawn anywhere on
     * the map.
     *
     * Returns the enemy spawn point or its core, if it exists.
     *
     * ```js
     * const [found, x, y, core] = unitLocate.spawn();
     *
     * if (!found) {
     *   print("No enemy core found");
     * } else if (core) {
     *   print`core location at (${x}, ${y})`;
     * } else {
     *   print`enemy spawn at (${x}, ${y})`;
     * }
     *
     * printFlush();
     * ```
     */
    function spawn<T extends BasicBuilding = AnyBuilding>():
      | [found: false]
      | [found: true, x: number, y: number, building: T];

    /**
     * Uses the unit bound to this processor to find a damaged ally building
     * anywhere on the map
     *
     * ```js
     * const [found, x, y, building] = unitLocate.damaged();
     *
     * if (found) {
     *   print`go fix a ${building} at (${x}, ${y})`;
     * } else {
     *   print("No damaged building found");
     * }
     * printFlush();
     * ```
     */
    function damaged<T extends BasicBuilding = AnyBuilding>():
      | [found: false]
      | [found: true, x: number, y: number, building: T];
  }

  /**
   * Jumps to the top of the instruction stack.
   *
   * ```js
   * const { switch1 } = getBuildings();
   *
   * if (!switch1.enabled) endScript();
   * // do something when the switch is enabled
   * ```
   */
  function endScript(): never;

  /**
   * Halts the execution of this processor. Can be used to debug code and
   * analyze the processor registers.
   *
   * ```js
   * // stop the processor to debug variables
   * stopScript();
   * ```
   */
  function stopScript(): never;
}
