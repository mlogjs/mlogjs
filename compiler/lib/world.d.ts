import {
  SettableBuilding,
  SettableUnit,
  TPermanentStatusEffect,
  TStatusEffect,
} from "./util";

/** Gets block data from the map. */
export namespace getBlock {
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

/** Sets block data on a given location. */
export namespace setBlock {
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
    team: TeamIdentifier;
    rotation: number;
  }): void;
}

/**
 * Spawns an unit at the given location.
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
export function spawnUnit<T extends BasicUnit = AnyUnit>(options: {
  type: UnitSymbol;
  x: number;
  y: number;
  team: TeamIdentifier;
  /** The initial rotation of the unit in degrees. */
  rotation?: number;
}): T;

/** Contains the variants for the `applyStatus` instruction. */
export namespace applyStatus {
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
 * ```js
 * // natural wave, units appear on the enemy spawn
 * spawnWave(true);
 *
 * // syntethic wave, units appear on the given coordinates
 * spawnWave(false, 10, 20);
 * ```
 */
export function spawnWave(natural: true): void;
export function spawnWave(natural: false, x: number, y: number): void;

/** Contains the multiple variants of the `set rule` instruction. */
export namespace setRule {
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
  function buildSpeed(team: TeamIdentifier, multiplier: number): void;

  /**
   * Sets the speed multiplier for unit factories. The multiplier will always be
   * clamped between `0` and `50`.
   *
   * ```js
   * setRule.unitBuildSpeed(Teams.sharded, 3);
   * ```
   */
  function unitBuildSpeed(team: TeamIdentifier, multiplier: number): void;

  /**
   * Sets the build cost multiplier for constructing units.
   *
   * ```js
   * setRule.unitCost(Teams.sharded, 1.75);
   * ```
   */
  function unitCost(team: TeamIdentifier, multiplier: number): void;

  /**
   * Sets the damage multiplier for units on a given team.
   *
   * ```js
   * setRule.unitDamage(Teams.sharded, 1.25);
   * ```
   */
  function unitDamage(team: TeamIdentifier, multiplier: number): void;

  /**
   * Sets the block health multiplier for a given team.
   *
   * ```js
   * setRule.blockHealth(Teams.crux, 0.75);
   * ```
   */
  function blockHealth(team: TeamIdentifier, multiplier: number): void;

  /**
   * Sets the block damage multiplier for a given team.
   *
   * ```js
   * setRule.blockDamage(Teams.crux, 2);
   * ```
   */
  function blockDamage(team: TeamIdentifier, multiplier: number): void;

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

  function rtsMinWeight(team: TeamIdentifier, value: number): void;

  /**
   * Sets the Real Time Strategy minimum size of attack squads of a team.
   *
   * The higher the value, the more units are required before a squad attacks.
   *
   * ```js
   * setRule.rtsMinSquad(Teams.sharded, 5);
   * ```
   */
  function rtsMinSquad(team: TeamIdentifier, value: number): void;
}

/**
 * Writes the contents of the print buffer in the selected mode and clears the
 * buffer afterwards.
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
export namespace flushMessage {
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

/** Controls the player camera. */
export namespace cutscene {
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
 * Creates an explosion.
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
export function explosion(options: {
  team: TeamIdentifier;
  x: number;
  y: number;
  radius: number;
  damage: number;
  air: boolean;
  ground: boolean;
  pierce: boolean;
}): void;

/**
 * Sets the speed of this world processor in instructions per tick.
 *
 * ```js
 * setRate(20);
 * ```
 */
export function setRate(ipt: number): void;

/** Contains the variants of the `fetch` instruction. */
export namespace fetch {
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
    team: TeamIdentifier,
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
  function unitCount(team: TeamIdentifier): number;
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
    team: TeamIdentifier,
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
  function playerCount(team: TeamIdentifier): number;
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
  function core(team: TeamIdentifier, index: number): AnyBuilding;
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
  function coreCount(team: TeamIdentifier): number;
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
    team: TeamIdentifier,
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
  function buildCount(team: TeamIdentifier, block: BuildingSymbol): number;
}

/**
 * Checks if a global flag is set.
 *
 * ```js
 * const flagEnabled = getFlag("foo");
 * ```
 */
export function getFlag(flag: string): boolean;

/**
 * Sets a global flag.
 *
 * ```js
 * setFlag("foo", true);
 * ```
 */
export function setFlag(flag: string, value: boolean): void;

/**
 * Creates a writable record that allows you to set a property of a building or
 * unit.
 *
 * ```js
 * const router = fetch.build(Teams.sharded, 0, Blocks.router);
 * setProp(router).team = Teams.derelict;
 * ```
 */
export function setProp(target: BasicBuilding): SettableBuilding;
export function setProp(target: BasicUnit): SettableUnit;

/**
 * Synchronizes an mlog register with the server. Can be called up to 20 times
 * per second.
 */
export function sync(variable: unknown): void;

export namespace effect {
  function warn(x: number, y: number): void;
  function cross(x: number, y: number): void;
  function blockFall(x: number, y: number, data: BlockSymbol): void;
  function placeBlock(x: number, y: number, size: number): void;
  function placeBlockSpark(x: number, y: number, size: number): void;
  function breakBlock(x: number, y: number, size: number): void;
  function spawn(x: number, y: number): void;
  function trail(options: {
    x: number;
    y: number;
    color: number;
    size: number;
  }): void;
  function breakPop(options: {
    x: number;
    y: number;
    color: number;
    size: number;
  }): void;
  function smokeCloud(x: number, y: number, color: number): void;
  function vapor(x: number, y: number, color: number): void;
  function hit(x: number, y: number, color: number): void;
  function hitSquare(x: number, y: number, color: number): void;
  function shootSmall(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function shootBig(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function smokeSmall(x: number, y: number, rotation: number): void;
  function smokeBig(x: number, y: number, rotation: number): void;
  function smokeColor(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function smokeSquare(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function smokeSquareBig(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function spark(x: number, y: number, color: number): void;
  function sparkBig(x: number, y: number, color: number): void;
  function sparkShoot(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function sparkShootBig(options: {
    x: number;
    y: number;
    color: number;
    rotation: number;
  }): void;
  function drill(x: number, y: number, color: number): void;
  function drillBig(x: number, y: number, color: number): void;
  function lightBlock(options: {
    x: number;
    y: number;
    color: number;
    size: number;
  }): void;
  function explosion(x: number, y: number, size: number): void;
  function smokePuff(x: number, y: number, color: number): void;
  function sparkExplosion(x: number, y: number, color: number): void;
  function crossExplosion(options: {
    x: number;
    y: number;
    color: number;
    size: number;
  }): void;
  function wave(options: {
    x: number;
    y: number;
    color: number;
    size: number;
  }): void;
  function bubble(x: number, y: number): void;
}
