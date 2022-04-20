import "./kind";
import { TRadarFilter, TRadarSort, TUnitLocateBuildingGroup } from "./util";
declare global {
  /**
   * Appends the items to the print buffer, calling this function
   * on its own will not print any contents to a message block.
   *
   * To print the contents of the print buffer and empty it call `printFlush`.
   *
   * @param items The items to be added to the print buffer.
   */
  function print(...items: unknown[]): void;

  /**
   * Fills the screen with a color.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(mode: "clear", r: number, g: number, b: number): void;

  /**
   * Sets the color for the next drawing operations.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "color",
    r: number,
    g: number,
    b: number,
    a?: number
  ): void;

  /**
   * Sets the width of the next lines to be drawn.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(mode: "stroke", width: number): void;

  /**
   * Draws a line between two points.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "line",
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void;

  /**
   * Draws a filled rectangle.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "rect",
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  /**
   * Draws a rectangle outline.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "lineRect",
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  /**
   * Draws a filled, regular polygon.
   * @param sides The number of sides the polygon should have
   * @param radius The smallest distance between a line and the center of the polygon
   * @param rotation The rotation of the polygon in degrees
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "poly",
    x: number,
    y: number,
    sides: number,
    radius: number,
    rotation: number
  ): void;

  /**
   * Draws the outline of a regular polygon.
   * @param sides The number of sides the polygon should have
   * @param radius The smallest distance between a line and the center of the polygon
   * @param rotation The rotation of the polygon in degrees
   *
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "linePoly",
    x: number,
    y: number,
    sides: number,
    radius: number,
    rotation: number
  ): void;

  /**
   * Draws a filled triangle.
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   */
  function draw(
    mode: "triangle",
    x: number,
    y: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): void;

  /**
   * Draws an image of the respective content. (like `Units.dagger` and `Blocks.router`)
   *
   * Warning: nothing is drawn until `drawFlush` is called.
   * @param image The symbol for the image to be drawn.
   * @param rotation The rotation of the image in degrees.
   * @example
   * ```
   * // draw a router
   * draw("image", 30, 30, Blocks.router, 15, 0);
   *
   * // draw the unit bound to the processor
   * draw("image", 60, 60, Vars.unit.type, 15, 0);
   * ```
   */
  function draw(
    mode: "image",
    x: number,
    y: number,
    image: symbol,
    size: number,
    rotation: number
  ): void;

  /**
   * Writes the contents of the print buffer into the target message
   * and clears the buffer afterwards.
   * @param target
   */
  function printFlush(target: BasicBuilding): void;

  /**
   * Writes the contents of the draw buffer into the target display
   * and clears the buffer afterwards.
   * @param target
   */
  function drawFlush(target: BasicBuilding): void;

  /**
   * Gets a block link by its index.
   * @param index
   */
  function getLink<T extends BasicBuilding = AnyBuilding>(index: number): T;

  /**
   * Sets whether the building is enabled or disabled.
   */
  function control(
    kind: "enabled",
    building: BasicBuilding,
    value: boolean
  ): void;

  /**
   * Makes the building shoot or aim at the given position
   * @param building The shooting building
   * @param shoot `true` to shoot, `false` to just aim at the position
   */
  function control(
    kind: "shoot",
    building: BasicBuilding & Shooting,
    x: number,
    y: number,
    shoot: boolean
  ): void;

  /**
   * Shoot at an unit with velocity prediction
   * @param building The shooting building
   * @param unit The target unit
   * @param shoot `true` to shoot, `false` to just aim
   */
  function control(
    kind: "shootp",
    building: BasicBuilding & Shooting,
    unit: BasicUnit,
    shoot: boolean
  ): void;

  /**
   * Sets the config of a block (like the item of a sorter)
   */
  function control(
    kind: "config",
    building: BasicBuilding,
    value: symbol
  ): void;

  /**
   * Sets the color of an illuminator
   */
  function control(
    kind: "color",
    building: BasicBuilding,
    r: number,
    g: number,
    b: number
  ): void;

  /**
   * Detects an unit nearby this `building`.
   * @param building The building used to detect potential targets
   * @param filter1 First filter for selecting a target. Setting it to "any" ignores it
   * @param filter2 Second filter for selecting a target. Setting it to "any" ignores it
   * @param filter3 Third filter for selecting a target. Setting it to "any" ignores it
   * @param order The n th unit that fits these requirements based on the sorting method
   *  (1 => first unit, 2 => second unit and so on)
   * @param sort The method on which the results should be sorted
   *
   * @example
   *  const turret = getBuilding("cyclone1")
   *  // returns the second nearest enemy unit
   *  const result = radar(turret, "enemy", "any", "any", 2, "distance")
   */
  function radar<T extends BasicUnit = AnyUnit>(
    building: BasicBuilding,
    filter1: TRadarFilter,
    filter2: TRadarFilter,
    filter3: TRadarFilter,
    order: number,
    sort: TRadarSort
  ): T;

  /**
   * Alternate way to access special properties on objects.
   *
   * This method allows you to use customly created symbols
   * and sensor them on buildings.
   * @param property The property to be sensed on the building
   * @param target
   *
   * @example
   *  let myBuilding = getBuilding("container1")
   *  // jsdoc doesn't allow me to type this
   * // variable, but you should type it as a symbol in this case
   *  let myCustomSymbol = getVar("@custom-symbol") // problably defined by a mod
   *  let result = sensor(myCustomSymbol, myBuilding)
   */
  function sensor<T>(property: symbol, target: BasicBuilding | BasicUnit): T;

  function wait(seconds: number): void;

  function lookup(kind: "block", index: number): BlockSymbol | null;
  function lookup(kind: "unit", index: number): UnitSymbol | null;
  function lookup(kind: "item", index: number): ItemSymbol | null;
  function lookup(kind: "liquid", index: number): LiquidSymbol | null;

  function unitBind(type: UnitSymbol): void;

  function unitControl(mode: "idle"): void;
  function unitControl(mode: "stop"): void;
  function unitControl(mode: "move", x: number, y: number): void;
  function unitControl(
    mode: "approach",
    x: number,
    y: number,
    radius: number
  ): void;
  function unitControl(mode: "boost", enable: boolean): void;
  function unitControl(mode: "pathfind"): void;
  function unitControl(
    mode: "target",
    x: number,
    y: number,
    shoot: boolean
  ): void;
  function unitControl(mode: "targetp", unit: BasicUnit, shoot: boolean): void;
  function unitControl(
    mode: "itemDrop",
    target: BasicBuilding | typeof Blocks.air,
    amount: number
  ): void;
  function unitControl(
    mode: "itemTake",
    target: BasicBuilding,
    item: ItemSymbol,
    amount: number
  ): void;
  function unitControl(mode: "payDrop"): void;
  function unitControl(mode: "payTake", takeUnits: boolean): void;
  function unitControl(mode: "payEnter"): void;
  function unitControl(mode: "mine", x: number, y: number): void;
  function unitControl(mode: "flag", value: number): void;
  function unitControl(
    mode: "build",
    x: number,
    y: number,
    block: BlockSymbol,
    rotation: number,
    config: unknown
  ): void;
  function unitControl<T extends BasicBuilding = AnyBuilding>(
    mode: "getBlock",
    x: number,
    y: number
  ): [type: BlockSymbol | null, building: T | null];
  function unitControl(
    mode: "within",
    x: number,
    y: number,
    radius: number
  ): boolean;

  function unitRadar<T extends BasicUnit>(
    filter1: TRadarFilter,
    filter2: TRadarFilter,
    filter3: TRadarFilter,
    order: number,
    sort: TRadarSort
  ): T;

  function unitLocate(
    find: "ore",
    ore: ItemSymbol
  ): [found: false] | [found: true, x: number, y: number];
  function unitLocate<T extends BasicBuilding = AnyBuilding>(
    find: "building",
    group: TUnitLocateBuildingGroup,
    enemy: boolean
  ): [found: false] | [found: true, x: number, y: number, building: T];
  function unitLocate<T extends BasicBuilding = AnyBuilding>(
    find: "spawn" | "damaged"
  ): [found: false] | [found: true, x: number, y: number, building: T];
}
