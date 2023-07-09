import { WithSymbols } from "./traits";

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

type CommonSettableProps = {
  [P in keyof typeof Items | keyof typeof Liquids]: number;
} & {
  team: TeamSymbol | number;
  health: number;
};

type TUnitSettableProps = CommonSettableProps & {
  x: number;
  y: number;
  flag: number;
  payloadType?: UnitSymbol | BuildingSymbol;
};

type TBuildingSettableProps = CommonSettableProps & {
  totalPower: number;
};

export type TSettablePropSymbol<T extends BasicBuilding | BasicUnit> = Extract<
  keyof TSettablePropMap<T>,
  symbol
>;
export type TSettablePropMap<T extends BasicBuilding | BasicUnit> =
  T extends BasicBuilding
    ? WithSymbols<TBuildingSettableProps>
    : WithSymbols<TUnitSettableProps>;

export type TLogicLinkNames<T extends string> =
  `${TLogicLinkName<T>}${TLogicLinkDigit}`;

/**
 * Converts a the name of a block into it's logic link variant.
 *
 * The transformation happens as follows:
 * - Remove the "Large" at the end of the name.
 * - If the name is all lowercase, return it.
 * - If the name is a single uppercase letter followed by lowercase letters,
 * return the name in lowercase form.
 * - Else, remove one letter from the beggining and repeat the process.
 */
export type TLogicLinkName<T extends string> = T extends `${infer First}Large`
  ? TLogicLinkName<First>
  : T extends Lowercase<string>
  ? T
  : T extends `${infer FirstChar extends Uppercase<string>}${infer Rest extends
      Lowercase<string>}`
  ? `${Lowercase<FirstChar>}${Rest}`
  : T extends `${string}${infer Rest}`
  ? TLogicLinkName<Rest>
  : never;

export type TLogicLinkDigit = 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9;
