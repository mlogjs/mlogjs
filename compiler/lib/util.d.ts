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

export type TSettablePropSymbol = Extract<keyof TSettablePropMap, symbol>;
export type TSettablePropMap = WithSymbols<
  {
    [P in
      | keyof typeof Items
      | keyof typeof Liquids
      | "x"
      | "y"
      | "rotation"
      | "health"
      | "totalPower"
      | "flag"]: number;
  } & {
    team: TeamSymbol | number;
    payloadType?: UnitSymbol | BuildingSymbol;
  }
>;
