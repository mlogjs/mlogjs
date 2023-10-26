import { MutableWithSymbols } from "./traits";

export type TRadarFilter =
  | "any"
  | "enemy"
  | "ally"
  | "player"
  | "attacker"
  | "flying"
  | "boss"
  | "ground";

export type TRadarFilterArray =
  | [TRadarFilter]
  | [TRadarFilter, TRadarFilter]
  | [TRadarFilter, TRadarFilter, TRadarFilter];

export type TRadarSort =
  | "distance"
  | "health"
  | "shield"
  | "armor"
  | "maxHealth";

export type TUnitLocateBuildingGroup =
  | "core"
  | "storage"
  | "generator"
  | "turret"
  | "factory"
  | "repair"
  | "rally"
  | "battery"
  | "reactor";

export type TStatusEffect =
  | "burning"
  | "freezing"
  | "unmoving"
  | "slow"
  | "wet"
  | "muddy"
  | "melting"
  | "sapped"
  | "tarred"
  | "overclock"
  | "shielded"
  | "shocked"
  | "blasted"
  | "corroded"
  | "spore-slowed"
  | "disarmed"
  | "electrified"
  | "invincible"
  | TPermanentStatusEffect;

export type TPermanentStatusEffect = "boss" | "overdrive";

type CommonSettableProps = Record<keyof typeof Items, number> & {
  team: TeamIdentifier;
  health: number;
};

interface SettableUnit
  extends MutableWithSymbols<
    CommonSettableProps & {
      x: number;
      y: number;
      flag: number;
      rotation: number;
      payloadType?: UnitSymbol | BuildingSymbol;
    }
  > {}

interface SettableBuilding
  extends MutableWithSymbols<
    CommonSettableProps &
      Record<keyof typeof Liquids, number> & {
        totalPower: number;
      }
  > {}

export type TLogicLinkNames<T extends string> =
  `${TLogicLinkName<T>}${TLogicLinkDigit}`;

/**
 * Converts a the name of a block into it's logic link variant.
 *
 * The transformation happens as follows:
 *
 * - If the name is all lowercase, return it.
 * - If the name is a single uppercase letter followed by lowercase letters,
 *   return the name in lowercase form.
 * - If the name has "Large" at the end, remove it and try again.
 * - Else, remove one letter from the beggining and try again.
 *
 * Based on [the mindustry source
 * code](https://github.com/Anuken/Mindustry/blob/93daa7a5dcc3fac9e5f40c3375e9f57ae4720ff4/core/src/mindustry/world/blocks/logic/LogicBlock.java#L103-L115).
 */
export type TLogicLinkName<T extends string> = T extends Lowercase<string>
  ? T
  : T extends `${Uppercase<string>}${Lowercase<string>}`
  ? Lowercase<T>
  : T extends `${infer Begin}Large`
  ? TLogicLinkName<Begin>
  : T extends `${string}${infer Rest}`
  ? TLogicLinkName<Rest>
  : never;

export type TLogicLinkDigit = 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9;
