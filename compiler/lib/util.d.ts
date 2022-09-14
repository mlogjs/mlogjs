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
