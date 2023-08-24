import "./kind";
import {
  TSettablePropMap,
  TSettablePropSymbol,
  TRadarFilter,
  TRadarSort,
  TUnitLocateBuildingGroup,
  TStatusEffect,
  TPermanentStatusEffect,
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
   *   ```js
   *   const { message2 } = getBuildings();
   *   printFlush(message2);
   *
   *   printFlush(); // defaults to message1
   *   ```
   */
  function printFlush(target: BasicBuilding): void;
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

  /** Looks up content symbols by their index. */
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
     *   const container = getBuilding("container1");
     *
     *   // ...
     *
     *   // drop 40 items on the container
     *   unitControl.itemDrop(container, 40);
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

  /** Gets block data from the map. Available ONLY for world processors. */
  namespace getBlock {
    /**
     * Gets the floor type on the given location
     *
     * ```js
     * const floorType = getBlock.floor(10, 20);
     * ```
     */
    function floor(x: number, y: number): EnvBlockSymbol;

    /**
     * Gets the ore type on the given location. `Blocks.air` if there is no ore
     *
     * ```js
     * const oreType = getBlock.ore(10, 20);
     *
     * if (oreType != Blocks.air) {
     *   print("found ", oreType);
     * } else {
     *   print("no ore found");
     * }
     * printFlush();
     * ```
     */
    function ore(x: number, y: number): OreSymbol | typeof Blocks.air;

    /**
     * Gets the block type on the give location. `Blocks.air` if there is no
     * block.
     *
     * ```js
     * const blockType = getBlock.block(10, 20);
     *
     * if (blockType != Blocks.air) {
     *   print("found ", blockType);
     * } else {
     *   print("no block found");
     * }
     * printFlush();
     * ```
     */
    function block(x: number, y: number): BlockSymbol;

    /**
     * Gets the building on the given location. `undefined` if there is no
     * building.
     *
     * ```js
     * const building = getBlock.building(10, 20);
     *
     * if (building != undefined) {
     *   print("found ", building, "");
     * } else {
     *   print("no building found");
     * }
     * printFlush();
     * ```
     */
    function building<T extends BasicBuilding = AnyBuilding>(
      x: number,
      y: number,
    ): T | undefined;
  }

  /** Sets block data on a given location. World processor ONLY. */
  namespace setBlock {
    // TODO: maybe have a separate floor symbol type?
    /**
     * Sets the floor of the tile at the given location.
     *
     * ```js
     * setBlock.floor(10, 20, Blocks.metalFloor5);
     * ```
     */
    function floor(x: number, y: number, to: EnvBlockSymbol): void;

    /**
     * Sets the ore at the given location. Use `Blocks.air` to remove any ore.
     *
     * ```js
     * setBlock.ore(10, 20, Blocks.oreCopper);
     * ```
     */
    function ore(x: number, y: number, to: OreSymbol | typeof Blocks.air): void;

    /**
     * Sets the block at a given location, it can be a regular building or an
     * environment block.
     *
     * ```js
     * setBlock.block({
     *   x: 10,
     *   y: 20,
     *   to: Blocks.router,
     *   rotation: 0,
     *   team: Teams.sharded,
     * });
     * ```
     */
    function block(options: {
      x: number;
      y: number;
      to: EnvBlockSymbol | BuildingSymbol;
      team: TeamSymbol;
      rotation: number;
    }): void;
  }

  /**
   * Spawns an unit at the given location. World processor ONLY.
   *
   * @param options.rotation The initial rotation of the unit in degrees.
   *
   *   ```js
   *   spawnUnit({
   *     team: Teams.sharded,
   *     type: Units.flare,
   *     x: 10,
   *     y: 20,
   *     rotation: 90,
   *   });
   *   ```
   */
  function spawnUnit<T extends BasicUnit = AnyUnit>(options: {
    type: UnitSymbol;
    x: number;
    y: number;
    team: TeamSymbol;
    /** The initial rotation of the unit in degrees. */
    rotation?: number;
  }): T;

  /**
   * Contains the variants for the `applyStatus` instruction. World processor
   * ONLY.
   */
  namespace applyStatus {
    /**
     * Applies a status effect to the given unit.
     *
     * The only status effects that don't require a duration are `overdrive` and
     * `boss`.
     *
     * ```js
     * applyStatus.apply("burning", Vars.unit, 10);
     * applyStatus.apply("boss", Vars.unit);
     * ```
     */
    function apply(
      status: Exclude<TStatusEffect, TPermanentStatusEffect>,
      unit: BasicUnit,
      duration: number,
    ): void;

    function apply(status: TPermanentStatusEffect, unit: BasicUnit): void;

    /**
     * Removes a status effect to the given unit.
     *
     * ```js
     * applyStatus.clear("burning", Vars.unit);
     * applyStatus.clear("boss", Vars.unit);
     * ```
     */
    function clear(status: TStatusEffect, unit: BasicUnit): void;
  }

  /**
   * Spawns an enemy wave, can be used even if there is an already active wave.
   *
   * World processor ONLY.
   *
   * ```js
   * // natural wave, units appear on the enemy spawn
   * spawnWave(true);
   *
   * // syntethic wave, units appear on the given coordinates
   * spawnWave(false, 10, 20);
   * ```
   */
  function spawnWave(natural: true): void;
  function spawnWave(natural: false, x: number, y: number): void;

  /**
   * Contains the multiple variants of the `set rule` instruction. World
   * processor ONLY.
   */
  namespace setRule {
    /**
     * Sets the wave countdown in seconds.
     *
     * ```js
     * setRule.currentWaveTime(10);
     * ```
     */
    function currentWaveTime(seconds: number): void;

    /**
     * Enables/disables the wave timer.
     *
     * ```js
     * setRule.waveTimer(true);
     * ```
     */
    function waveTimer(enabled: boolean): void;

    /**
     * Allows or prevents waves from spawning.
     *
     * ```js
     * setRule.waves(true);
     * ```
     */
    function waves(enabled: boolean): void;

    /**
     * Sets the current wave number.
     *
     * ```js
     * setRule.wave(10);
     * ```
     */
    function wave(number: number): void;

    /**
     * Sets the time between waves in seconds.
     *
     * ```js
     * setRule.waveSpacing(180);
     * ```
     */
    function waveSpacing(seconds: number): void;

    /**
     * Sets wether waves can be manually summoned by pressing the play button.
     *
     * ```js
     * setRule.waveSending(true);
     * ```
     */
    function waveSending(enabled: boolean): void;

    /**
     * Sets wether the gamemode is the attack mode
     *
     * ```js
     * setRule.attackMode(true);
     * ```
     */
    function attackMode(enabled: boolean): void;

    /**
     * Sets the radius of the no-build zone around enemy cores.
     *
     * ```js
     * setRule.enemyCoreBuildRadius(150);
     * ```
     */
    function enemyCoreBuildRadius(radius: number): void;

    /**
     * Sets the radius around enemy wave drop zones.
     *
     * ```js
     * setRule.dropZoneRadius(20);
     * ```
     */
    function dropZoneRadius(radius: number): void;

    /**
     * Sets the base unit cap.
     *
     * ```js
     * setRule.unitCap(40);
     * ```
     */
    function unitCap(cap: number): void;

    /**
     * Sets the playable map area. Blocks that are out of the new bounds will be
     * removed.
     *
     * ```js
     * setRule.mapArea({
     *   x: 0,
     *   y: 0,
     *   width: 500,
     *   height: 500,
     * });
     * ```
     */
    function mapArea(options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;

    /** Sets wether ambient lighting is enabled */
    function lighting(enabled: boolean): void;

    /**
     * Sets the ambient light color.
     *
     * `packColor` can be used to get the rgba data recevied by this function.
     *
     * ```js
     * // enables lighting and sets the color to gray
     * setRule.lighting(true);
     * setRule.ambientLight(packColor(0.5, 0.5, 0.5, 1));
     * ```
     */
    function ambientLight(rgbaData: number): void;

    /**
     * Sets the multiplier for the energy output of solar panels.
     *
     * ```js
     * setRule.solarMultiplier(10);
     * ```
     */
    function solarMultiplier(multiplier: number): void;

    /**
     * Sets the build speed multiplier of a team. The multiplier will always be
     * clamped between `0.001` and `50`.
     *
     * ```js
     * setRule.buildSpeed(Teams.sharded, 1.5);
     * ```
     */
    function buildSpeed(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the speed multiplier for unit factories. The multiplier will always
     * be clamped between `0` and `50`.
     *
     * ```js
     * setRule.unitBuildSpeed(Teams.sharded, 3);
     * ```
     */
    function unitBuildSpeed(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the build cost multiplier for constructing units.
     *
     * ```js
     * setRule.unitCost(Teams.sharded, 1.75);
     * ```
     */
    function unitCost(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the damage multiplier for units on a given team.
     *
     * ```js
     * setRule.unitDamage(Teams.sharded, 1.25);
     * ```
     */
    function unitDamage(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the block health multiplier for a given team.
     *
     * ```js
     * setRule.blockHealth(Teams.crux, 0.75);
     * ```
     */
    function blockHealth(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the block damage multiplier for a given team.
     *
     * ```js
     * setRule.blockDamage(Teams.crux, 2);
     * ```
     */
    function blockDamage(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the Real Time Strategy minimum weight for a team.
     *
     * In other words it, sets the minimum "advantage" needed for a squad to
     * attack. The higher the value, the more cautious the squad is.
     *
     * ```js
     * setRule.rtsMinWeight(Teams.sharded, 3);
     * ```
     */

    function rtsMinWeight(team: TeamSymbol, value: number): void;

    /**
     * Sets the Real Time Strategy minimum size of attack squads of a team.
     *
     * The higher the value, the more units are required before a squad attacks.
     *
     * ```js
     * setRule.rtsMinSquad(Teams.sharded, 5);
     * ```
     */
    function rtsMinSquad(team: TeamSymbol, value: number): void;
  }

  /**
   * Writes the contents of the print buffer in the selected mode and clears the
   * buffer afterwards. World processor ONLY.
   *
   * ```js
   * print("Hello");
   * flushMessage.announce(4); // lasts 4 seconds
   * wait(5);
   * print("World");
   * flushMessage.toast(4);
   * wait(5);
   * ```
   */
  namespace flushMessage {
    /**
     * Shows a nofication at the top of the screen
     *
     * ```js
     * print("something");
     * flushMessage.notify();
     * ```
     */
    function notify(): void;
    /**
     * Puts the content on the top left corner of the screen
     *
     * ```js
     * print("something");
     * flushMessage.mission();
     * ```
     */
    function mission(): void;
    /**
     * Puts the content on the middle of the screen
     *
     * @param duration The duration, in seconds
     *
     *   ```js
     *   print("something");
     *   flushMessage.announce(3);
     *   ```
     */
    function announce(duration: number): void;
    /**
     * Puts the content on the middle top of the screen
     *
     * @param duration The duration, in seconds
     *
     *   ```js
     *   print("something");
     *   flushMessage.toast(5);
     *   ```
     */
    function toast(duration: number): void;
  }

  /** Controls the player camera. World processor ONLY. */
  namespace cutscene {
    /**
     * Moves the player's camera to the given location.
     *
     * ```js
     * cutscene.pan({
     *   x: 10,
     *   y: 20,
     *   speed: 15,
     * });
     * ```
     */
    function pan(options: { x: number; y: number; speed: number }): void;
    /**
     * Zooms the player camera to the desired level
     *
     * ```js
     * cutscene.zoom(3);
     * ```
     */
    function zoom(level: number): void;
    /**
     * Gives the camera control back to the player
     *
     * ```js
     * cutscene.stop();
     * ```
     */
    function stop(): void;
  }

  /**
   * Creates an explosion. World processor ONLY.
   *
   * ```js
   * explosion({
   *   team: Teams.crux,
   *   x: 5,
   *   y: 15,
   *   radius: 20,
   *   damage: 100,
   *   air: true,
   *   ground: true,
   *   pierce: true,
   * });
   * ```
   */
  function explosion(options: {
    team: TeamSymbol;
    x: number;
    y: number;
    radius: number;
    damage: number;
    air: boolean;
    ground: boolean;
    pierce: boolean;
  }): void;

  /**
   * Sets the speed of this world processor in instructions per tick. World
   * processor ONLY.
   *
   * ```js
   * setRate(20);
   * ```
   */
  function setRate(ipt: number): void;

  /** Contains the variants of the `fetch` instruction. World processor ONLY. */
  namespace fetch {
    /**
     * Gets an unit from the given team
     *
     * The index starts at 0.
     *
     * ```js
     * const count = fetch.unitCount(Teams.sharded);
     * for (let i = 0; i < count; i++) {
     *   const unit = fetch.unit(Teams.sharded, i);
     *   print`x: ${unit.x}, y: ${unit.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function unit<T extends BasicUnit = AnyUnit>(
      team: TeamSymbol,
      index: number,
    ): T;
    /**
     * Gets the amount of units existing on a given team.
     *
     * ```js
     * const count = fetch.unitCount(Teams.sharded);
     * for (let i = 0; i < count; i++) {
     *   const unit = fetch.unit(Teams.sharded, i);
     *   print`x: ${unit.x}, y: ${unit.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function unitCount(team: TeamSymbol): number;
    /**
     * Gets a player from a team.
     *
     * The index starts at 0.
     *
     * ```js
     * const count = fetch.playerCount(Teams.sharded);
     * for (let i = 0; i < count; i++) {
     *   const player = fetch.player(Teams.sharded, i);
     *   print`x: ${player.x}, y: ${player.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function player<T extends BasicUnit = AnyUnit>(
      team: TeamSymbol,
      index: number,
    ): T;
    /**
     * Gets the amount of players existing on a given team.
     *
     * ```js
     * const count = fetch.playerCount(Teams.sharded);
     * for (let i = 0; i < count; i++) {
     *   const player = fetch.player(Teams.sharded, i);
     *   print`x: ${player.x}, y: ${player.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function playerCount(team: TeamSymbol): number;
    /**
     * Gets a core from a team.
     *
     * The index of the starts at 0.
     *
     * ```js
     * const count = fetch.coreCount(Teams.sharded);
     * for (let i = 0; i < count; i++) {
     *   const core = fetch.core(Teams.sharded, i);
     *   print`x: ${core.x}, y: ${core.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function core(team: TeamSymbol, index: number): AnyBuilding;
    /**
     * Gets the amount of cores existing on a given team.
     *
     * ```js
     * const count = fetch.coreCount(Teams.sharded);
     * for (let i = 0; i < count; i++) {
     *   const core = fetch.core(Teams.sharded, i);
     *   print`x: ${core.x}, y: ${core.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function coreCount(team: TeamSymbol): number;
    /**
     * Gets a building from a team.
     *
     * The index starts at 0.
     *
     * ```js
     * const count = fetch.buildCount(Teams.sharded, Blocks.router);
     * for (let i = 0; i < count; i++) {
     *   const router = fetch.build(Teams.sharded, i, Blocks.router);
     *   print`x: ${router.x}, y: ${router.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function build<T extends BasicBuilding = AnyBuilding>(
      team: TeamSymbol,
      index: number,
      block: BuildingSymbol,
    ): T;
    /**
     * Gets the amount of buildings existing on a given team.
     *
     * ```js
     * const count = fetch.buildCount(Teams.sharded, Blocks.router);
     * for (let i = 0; i < count; i++) {
     *   const router = fetch.build(Teams.sharded, i, Blocks.router);
     *   print`x: ${router.x}, y: ${router.y}\n`;
     * }
     * printFlush();
     * ```
     */
    function buildCount(team: TeamSymbol, block: BuildingSymbol): number;
  }

  /**
   * Checks if a global flag is set. World processor ONLY.
   *
   * ```js
   * const flagEnabled = getFlag("foo");
   * ```
   */
  function getFlag(flag: string): boolean;

  /**
   * Sets a global flag. World processor ONLY.
   *
   * ```js
   * setFlag("foo", true);
   * ```
   */
  function setFlag(flag: string, value: boolean): void;

  /**
   * Sets a property of a building or unit. World processor ONLY.
   *
   * ```js
   * const router = fetch.build(Teams.sharded, 0, Blocks.router);
   * setProp(LAccess.team, router, Teams.derelict);
   * ```
   */
  function setProp<
    T extends BasicUnit | BasicBuilding,
    K extends TSettablePropSymbol<T>,
  >(property: K, target: T, value: TSettablePropMap<T>[K]): void;
}
