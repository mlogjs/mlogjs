import "./globals";
import "./custom-lib";

type LogicSymbols = typeof Items & typeof Liquids & typeof LAccess;

type WithSymbols<T extends Record<string, unknown>> = T & {
  readonly [K in keyof (LogicSymbols | T) as LogicSymbols[K]]: T[K];
};

declare global {
  type LiquidHolder = WithSymbols<
    {
      readonly [L in keyof typeof Liquids]: number;
    } & {
      readonly totalLiquids: number;
      readonly liquidCapacity: number;
    }
  >;

  type ItemHolder = WithSymbols<
    {
      readonly [I in keyof typeof Items]: number;
    } & {
      readonly totalItems: number;
      readonly firstItem: ItemSymbol | null;
      readonly itemCapacity: number;
    }
  >;

  type PowerHolder = WithSymbols<{
    readonly totalPower: number;
    readonly powerCapacity: number;
    readonly powerNetStored: number;
    readonly powerNetCapacity: number;
    readonly powerNetIn: number;
    readonly powerNetOut: number;
  }>;

  type Shooting = WithSymbols<{
    readonly shootX: number;
    readonly shootY: number;
    readonly ammo: number;
    readonly ammoCapacity: number;
  }>;

  type WithHealth = WithSymbols<{
    readonly health: number;
    readonly maxHealth: number;
    readonly dead: boolean;
  }>;

  type Heatable = WithSymbols<{
    readonly heat: number;
  }>;

  type WithEffiency = WithSymbols<{
    readonly efficiency: number;
  }>;

  type WithProgress = WithSymbols<{
    readonly progress: number;
  }>;

  type WithTimescale = WithSymbols<{
    readonly timescale: number;
  }>;

  type Rotatable = WithSymbols<{
    readonly rotation: number;
  }>;

  type Spaced = WithSymbols<{
    readonly x: number;
    readonly y: number;
    readonly size: number;
  }>;

  type Ranged = WithSymbols<{
    readonly range: number;
  }>;

  type Boosted = WithSymbols<{
    readonly boosting: number;
  }>;

  type Mining = WithSymbols<{
    readonly mineX: number;
    readonly mineY: number;
    readonly mining: number;
  }>;

  type Typed<T extends symbol = symbol> = WithSymbols<{
    readonly type: T;
  }>;
  type Flagged = WithSymbols<{
    readonly flag: number;
  }>;

  type Controllable = WithSymbols<{
    readonly controlled: 0 | ControlKind;
    readonly controller: AnyUnit | BasicBuilding;
  }>;

  type Nameable = WithSymbols<{
    readonly name: string | null;
  }>;

  type PayloadHolder = WithSymbols<{
    readonly payloadCount: number;
    readonly payloadType: symbol | null;
  }>;

  type WithEnable = WithSymbols<{
    enabled: boolean;
  }>;

  type WithConfig<T extends symbol | number | null = symbol | null> =
    WithSymbols<{
      readonly config: T;
    }>;
}
