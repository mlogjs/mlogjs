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
   * Appends draw contents to the draw buffer.
   *
   * Warning: these methods only append data to the draw buffer,
   * which is used by `drawFlush` to actually draw content on a display.
   */
  function draw(mode: "clear", r: number, g: number, b: number): void;

  function draw(
    mode: "color",
    r: number,
    g: number,
    b: number,
    a: number
  ): void;

  function draw(mode: "stroke", width: number): void;

  function draw(
    mode: "line",
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void;

  function draw(
    mode: "rect",
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  function draw(
    mode: "lineRect",
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  function draw(
    mode: "poly",
    x: number,
    y: number,
    sides: number,
    radius: number,
    rotation: number
  ): void;

  function draw(
    mode: "linePoly",
    x: number,
    y: number,
    sides: number,
    radius: number,
    rotation: number
  ): void;

  function draw(
    mode: "triangle",
    x: number,
    y: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): void;

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

  function control(
    kind: "enabled",
    building: BasicBuilding,
    value: boolean
  ): void;

  function control(
    kind: "shoot",
    building: BasicBuilding & Shooting,
    x: number,
    y: number,
    shoot: boolean
  ): void;

  function control(
    kind: "shootp",
    building: BasicBuilding & Shooting,
    unit: BasicUnit,
    shoot: boolean
  ): void;

  function control(
    kind: "config",
    building: BasicBuilding,
    value: symbol
  ): void;

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
   *  let turret = getBuilding("cyclone1")
   *  // returns the second nearest enemy unit
   *  let result = radar(turret, "enemy", "any", "any", 2, "distance")
   */
  function radar<T extends BasicUnit | BasicBuilding = AnyBuilding | AnyUnit>(
    building: BasicBuilding,
    filter1: TRadarFilter,
    filter2: TRadarFilter,
    filter3: TRadarFilter,
    order: number,
    sort: TRadarSort
  ): T;

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
  function unitControl(
    mode: "getBlock",
    x: number,
    y: number
  ): [type: BlockSymbol | null, building: BasicBuilding | null];
  function unitControl(
    mode: "within",
    x: number,
    y: number,
    radius: number
  ): boolean;

  function unitRadar<T extends BasicBuilding | BasicUnit>(
    filter1: TRadarFilter,
    filter2: TRadarFilter,
    filter3: TRadarFilter,
    order: boolean,
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

  function asm(line: TemplateStringsArray): void;
}
