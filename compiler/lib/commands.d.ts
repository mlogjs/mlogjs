import "./kind";
import {
  TRadarFilter,
  TRadarSort,
  TUnitEffect,
  TUnitLocateBuildingGroup,
} from "./util";
declare global {
  /**
   * Appends the items to the print buffer, calling this function
   * on its own will not print any contents to a message block.
   *
   * To print the contents of the print buffer and empty it call `printFlush`.
   *
   * @param items The items to be added to the print buffer.
   *
   * ```js
   *  // call normally
   *  print("a + b = ", left, " + ", right, " = ", left + right)
   *
   *  // call with tagged string templates
   *  print`a + b = ${left} + ${right} = ${left + right}`
   * ```
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
   *
   * Example:
   * ```js
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
   * @param target The message building to write to. Writes to `message1` by default.
   *
   * Note that the default value only applies if you don't pass any parameter to this function.
   */
  function printFlush(target?: BasicBuilding): void;

  /**
   * Writes the contents of the draw buffer into the target display
   * and clears the buffer afterwards.
   * @param target The display building to write to. Writes to `display1` by default.
   *
   * Note that the default value only applies if you don't pass any parameter to this function.
   */
  function drawFlush(target?: BasicBuilding): void;

  /**
   * Gets a block link by its index.
   *
   * To make safe queries it is recommended to check an index
   * before trying to get a link. This can be done by using `Vars.links`.
   * @param index
   *
   * Example:
   * ```js
   * if(index < Vars.links) {
   *   myBlock = getLink(index)
   * }
   * ```
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
   * Example:
   * ```js
   *  const turret = getBuilding("cyclone1")
   *  // returns the second nearest enemy unit
   *  const result = radar(turret, "enemy", "any", "any", 2, "distance")
   * ```
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
   * Example:
   * ```js
   *  let myBuilding = getBuilding("container1")
   *  // jsdoc doesn't allow me to type this
   * // variable, but you should type it as a symbol in this case
   *  let myCustomSymbol = getVar("@custom-symbol") // problably defined by a mod
   *  let result = sensor(myCustomSymbol, myBuilding)
   * ```
   */
  function sensor<T>(property: symbol, target: BasicBuilding | BasicUnit): T;

  /**
   * Stops the execution for the given amount of seconds
   */
  function wait(seconds: number): void;

  /**
   * Looks up a block symbol by it's index on the content registry.
   *
   * Use `Vars.blockCount` to check the maximum index allowed.
   *
   * Example:
   * ```js
   * if(index < Vars.blockCount) {
   *   let blockKind = lookup("block", index);
   * }
   * ```
   */
  function lookup(kind: "block", index: number): BlockSymbol;
  /**
   * Looks up an unit symbol by it's index on the content registry.
   *
   * Use `Vars.unitCount` to check the maximum index allowed.
   *
   * Example:
   * ```js
   * if(index < Vars.unitCount) {
   *   let unitKind = lookup("unit", index);
   * }
   * ```
   */
  function lookup(kind: "unit", index: number): UnitSymbol | null;
  /**
   * Looks up an item symbol by it's index on the content registry.
   *
   * Use `Vars.itemCount` to check the maximum index allowed.
   *
   * Example:
   * ```js
   * if(index < Vars.itemCount) {
   *   let itemKind = lookup("item", index);
   * }
   * ```
   */
  function lookup(kind: "item", index: number): ItemSymbol | null;
  /**
   * Looks up a liquid symbol by it's index on the content registry.
   *
   * Use `Vars.liquidCount` to check the maximum index allowed.
   *
   * Example:
   * ```js
   * if(index < Vars.liquidCount) {
   *   let liquidKind = lookup("liquid", index);
   * }
   * ```
   */
  function lookup(kind: "liquid", index: number): LiquidSymbol | null;

  /**
   * Packs RGBA color information into a single number.
   *
   * Each paremeter must range from `0` to `1`.
   */
  function packColor(r: number, g: number, b: number, a: number): number;

  /**
   * Binds an unit to the this processor. The unit is accessible at `Vars.unit`
   */
  function unitBind(type: UnitSymbol): void;

  /**
   * Makes the unit bound to this processor stop moving but
   * allows it to keep doing it's action (like mining or building)
   */
  function unitControl(mode: "idle"): void;
  /**
   * Makes the unit bound to this processor stop mining, building and moving
   */
  function unitControl(mode: "stop"): void;
  /**
   * Makes the unit bound to this processor move to the given position
   */
  function unitControl(mode: "move", x: number, y: number): void;
  /**
   * Makes the unit bound to this processor approach the given position at the given radius
   * @param radius How distant to the position the unit can be
   */
  function unitControl(
    mode: "approach",
    x: number,
    y: number,
    radius: number
  ): void;
  /**
   * Whether the unit bound to this processor should be boosted (floating)
   */
  function unitControl(mode: "boost", enable: boolean): void;
  /**
   * Makes the unit bound to this processor move to the enemy spawn
   */
  function unitControl(mode: "pathfind"): void;
  /**
   * Makes the unit bound to this processor shoot/aim at the given position
   * @param shoot `true` to shoot, `false` to just aim
   */
  function unitControl(
    mode: "target",
    x: number,
    y: number,
    shoot: boolean
  ): void;
  /**
   * Makes the unit bound to this processor target an unit with velocity prediction
   * @param unit The shoot target
   * @param shoot `true` to shoot, `false` to just aim
   */
  function unitControl(mode: "targetp", unit: BasicUnit, shoot: boolean): void;
  /**
   * Makes the unit bound to this processor drop it's held items onto the given target
   * @param target Where to drop the items, if `EnvBlocks.air`, the unit will throw it's items away
   * @param amount How many items should be dropped
   */
  function unitControl(
    mode: "itemDrop",
    target: BasicBuilding | typeof Blocks.air,
    amount: number
  ): void;
  /**
   * Makes the unit bound to this processor take items from a building
   * @param target The building that will have it's items taken
   * @param item The kind of item to take
   * @param amount How many items should be taken
   */
  function unitControl(
    mode: "itemTake",
    target: BasicBuilding,
    item: ItemSymbol,
    amount: number
  ): void;
  /**
   * Makes the unit bound to this processor drop one entity from it's payload
   */
  function unitControl(mode: "payDrop"): void;
  /**
   * Makes the unit bound to this processor take an entity into it's payload
   * @param takeUnits Whether to take units or buildings
   */
  function unitControl(mode: "payTake", takeUnits: boolean): void;
  /**
   * Makes the unit bound to this processor enter/land on the
   * payload block the unit is on
   */
  function unitControl(mode: "payEnter"): void;
  /**
   * Makes the unit bound to this processor mine at the given position
   */
  function unitControl(mode: "mine", x: number, y: number): void;
  /**
   * Sets the numeric flag of the unit bound to this processor
   */
  function unitControl(mode: "flag", value: number): void;
  /**
   * Makes the unit bound to this processor build a building with the
   * given properties
   * @param block The kind of building to build
   * @param rotation The rotation of the building, ranges from 0 to 3
   * @param config The config of the building
   */
  function unitControl(
    mode: "build",
    x: number,
    y: number,
    block: BuildingSymbol,
    rotation: number,
    config: unknown
  ): void;
  /**
   * Makes the unit bound to this processor data about a block at the given position
   */
  function unitControl<T extends BasicBuilding = AnyBuilding>(
    mode: "getBlock",
    x: number,
    y: number
  ): [type: BlockSymbol | null, building: T | null];
  /**
   * Checks if the unit bound to this processor is within a radius of a given position.
   */
  function unitControl(
    mode: "within",
    x: number,
    y: number,
    radius: number
  ): boolean;

  /**
   * Finds an unit near the unit bound to this processor
   * @param filter1 First filter for selecting a target. Setting it to "any" ignores it
   * @param filter2 Second filter for selecting a target. Setting it to "any" ignores it
   * @param filter3 Third filter for selecting a target. Setting it to "any" ignores it
   * @param order The n th unit that fits these requirements based on the sorting method
   *  (1 => first unit, 2 => second unit and so on)
   * @param sort The method on which the results should be sorted
   *
   * Example:
   * ```js
   *  // returns the second nearest enemy unit
   *  const result = unitRadar("enemy", "any", "any", 2, "distance")
   * ```
   */
  function unitRadar<T extends BasicUnit = AnyUnit>(
    filter1: TRadarFilter,
    filter2: TRadarFilter,
    filter3: TRadarFilter,
    order: number,
    sort: TRadarSort
  ): T;

  /**
   * Uses the unit bound to this processor to find an ore vein anywhere on the map
   * @param ore The kind of item the ore should contain
   */
  function unitLocate(
    find: "ore",
    ore: ItemSymbol
  ): [found: false] | [found: true, x: number, y: number];
  /**
   * Uses the unit bound to this processor to find a building anywhere on the map
   * @param group The group that the building belongs to
   * @param enemy Whether it should be an enemy building or an ally one
   */
  function unitLocate<T extends BasicBuilding = AnyBuilding>(
    find: "building",
    group: TUnitLocateBuildingGroup,
    enemy: boolean
  ): [found: false] | [found: true, x: number, y: number, building: T];
  /**
   * Uses the unit bound to this processor to find an enemy spawn anywhere on the map.
   *
   * May return a building (a core) or a position
   * @param find
   */
  function unitLocate<T extends BasicBuilding = AnyBuilding>(
    find: "spawn"
  ): [found: false] | [found: true, x: number, y: number, building: T];
  /**
   * Uses the unit bound to this processor to find a damaged ally buildings anywhere on the map
   * @param find
   */
  function unitLocate<T extends BasicBuilding = AnyBuilding>(
    find: "damaged"
  ): [found: false] | [found: true, x: number, y: number, building: T];

  /**Jumps to the top of the instruction stack*/
  function endScript(): never;

  /** Halts the execution of this processor */
  function stopScript(): never;

  /** Gets the floor type on the given location */
  function getBlock(kind: "floor", x: number, y: number): EnvBlockSymbol;
  /** Gets the ore type on the given location. `Blocks.air` if there is no ore */
  function getBlock(
    kind: "ore",
    x: number,
    y: number
  ): OreSymbol | typeof Blocks.air;
  /** Gets the block type on the give location. `Blocks.air` if there is no block. */
  function getBlock(kind: "block", x: number, y: number): BlockSymbol;
  /** Gets the building on the given location. `null` if there is no building. */
  function getBlock<T extends BasicBuilding = AnyBuilding>(
    type: "building",
    x: number,
    y: number
  ): T | null;

  // TODO: maybe have a separate floor symbol type?
  /** Sets the floor of the tile at the given location. */
  function setBlock(
    kind: "floor",
    x: number,
    y: number,
    to: EnvBlockSymbol
  ): void;
  /** Sets the ore at the given location. Use `Blocks.air` to remove any ore. */
  function setBlock(
    kind: "ore",
    x: number,
    y: number,
    to: OreSymbol | typeof Blocks.air
  ): void;
  /** Sets the block at a given location, it can be a regular building or an environment block. */
  function setBlock(
    kind: "block",
    x: number,
    y: number,
    to: EnvBlockSymbol | BuildingSymbol,
    team: TeamSymbol,
    rotation: number
  ): void;

  /** Spawns an unit at the given location */
  function spawnUnit<T extends BasicUnit = AnyUnit>(
    type: UnitSymbol,
    x: number,
    y: number,
    team: TeamSymbol,
    rotation?: number
  ): T;

  /**
   * Applies or removes a status effect to the given unit.
   *
   * The only status effects that don't require a duration are `overdrive` and `boss`.
   */
  function applyStatus(
    kind: "apply",
    status: Exclude<TUnitEffect, "overdrive" | "boss">,
    unit: BasicUnit,
    duration: number
  ): void;
  function applyStatus(
    kind: "apply",
    status: "overdrive" | "boss",
    unit: BasicUnit
  ): void;
  function applyStatus(
    kind: "clear",
    status: TUnitEffect,
    unit: BasicUnit
  ): void;

  /**
   * Spawns an enemy wave, can be used even if there is an already active wave.
   */
  function spawnWave(natural: true): void;
  function spawnWave(natural: false, x: number, y: number): void;

  /** Sets the wave countdown in seconds. */
  function setRule(rule: "currentWaveTime", seconds: number): void;
  /** Enables/disables the wave timer. */
  function setRule(rule: "waveTimer", enabled: boolean): void;
  /** Allows or prevents waves from spawning. */
  function setRule(rule: "waves", enabled: boolean): void;
  /** Sets the current wave number. */
  function setRule(rule: "wave", number: number): void;
  /** Sets the time between waves in seconds. */
  function setRule(rule: "waveSpacing", seconds: number): void;
  /** Sets wether waves can be manually summoned by pressing the play button. */
  function setRule(rule: "waveSending", enabled: boolean): void;
  /** Sets wether the gamemode is the attack mode */
  function setRule(rule: "attackMode", enabled: boolean): void;
  /** Sets the radius of the no-build zone around enemy cores. */
  function setRule(rule: "enemyCoreBuildRadius", radius: number): void;
  /** Sets the radius around enemy wave drop zones. */
  function setRule(rule: "dropZoneRadius", radius: number): void;
  /** Sets the base unit cap. */
  function setRule(rule: "unitCap", cap: number): void;
  /** Sets the playable map area. Blocks that are out of the new bounds will be removed.  */
  function setRule(
    rule: "mapArea",
    x: number,
    y: number,
    width: number,
    height: number
  ): void;
  /** Sets wether ambient lighting is enabled */
  function setRule(rule: "lighting", enabled: boolean): void;
  /**
   * Sets the ambient light color.
   *
   * `packColor` can be used to get the rgba data recevied by this function.
   *
   *
   * ```js
   * // enables lighting and sets the color to gray
   * setRule("lighting", true);
   * setRule("ambientLight", packColor(0.5, 0.5, 0.5, 1));
   * ```
   */
  function setRule(rule: "ambientLight", rgbaData: number): void;
  /** Sets the multiplier for the energy output of solar panels. */
  function setRule(rule: "solarMultiplier", multiplier: number): void;
  /**
   * Sets the build speed multiplier of a team.
   * The multiplier will always be clamped between `0.001` and `50`.
   */
  function setRule(
    rule: "buildSpeed",
    team: TeamSymbol,
    multiplier: number
  ): void;
  /**
   * Sets the speed multiplier for unit factories.
   * The multiplier will always be clamped between `0` and `50`.
   */
  function setRule(
    rule: "unitBuildSpeed",
    team: TeamSymbol,
    multiplier: number
  ): void;
  /** Sets the damage multiplier for units on a given team. */
  function setRule(
    rule: "unitDamage",
    team: TeamSymbol,
    multiplier: number
  ): void;
  /** Sets the block health multiplier for a given team. */
  function setRule(
    rule: "blockHealth",
    team: TeamSymbol,
    multiplier: number
  ): void;
  /** Sets the block damage multiplier for a given team. */
  function setRule(
    rule: "blockDamage",
    team: TeamSymbol,
    multiplier: number
  ): void;
  /**
   * Sets the Real Time Strategy minimum weight for a team.
   *
   * In other words it, sets the minimum "advantage" needed for a squad to attack.
   * The higher the value, the more cautious the squad is.
   */
  function setRule(rule: "rtsMinWeight", team: TeamSymbol, value: number): void;
  /**
   * Sets the Real Time Strategy minimum size of attack squads of a team.
   *
   * The higher the value, the more units are required before a squad attacks.
   */
  function setRule(rule: "rtsMinSquad", team: TeamSymbol, value: number): void;

  /**
   * Writes the contents of the print buffer in the selected mode
   * and clears the buffer afterwards.
   *
   * ```js
   * print("Hello");
   * flushMessage("announce", 4); // lasts 4 seconds
   * wait(5);
   * print("World");
   * flushMessage("toast", 4);
   * wait(5);
   * ```
   */
  function flushMessage(kind: "notify" | "mission"): void;
  function flushMessage(kind: "announce" | "toast", duration: number): void;

  /** Moves the player's camera to the given location. */
  function cutscene(mode: "pan", x: number, y: number, speed: number): void;
  /** Zooms the player camera to the desired level */
  function cutscene(mode: "zoom", level: number): void;
  /** Gives the camera control back to the player */
  function cutscene(mode: "stop"): void;

  /** Creates an explosion */
  function explosion(
    team: TeamSymbol,
    x: number,
    y: number,
    radius: number,
    damage: number,
    air: boolean,
    ground: boolean,
    pierce: boolean
  ): void;
}
