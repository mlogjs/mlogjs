import { NumericLiteral } from "@babel/types";
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

export type TUnitEffect =
  | "burning"
  | "freezing"
  | "unmoving"
  | "wet"
  | "melting"
  | "sapped"
  | "electrified"
  | "spore-slowed"
  | "tarred"
  | "overdrive"
  | "overclock"
  | "boss"
  | "shocked"
  | "blasted";

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
