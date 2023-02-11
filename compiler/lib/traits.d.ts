import "./globals";

type LogicSymbols = typeof Items & typeof Liquids & typeof LAccess;

type WithSymbols<T extends Record<string, unknown>> = T & {
  readonly [K in keyof (LogicSymbols | T) as LogicSymbols[K]]: T[K];
};

declare global {
  interface LiquidHolder
    extends WithSymbols<
      {
        readonly [L in keyof typeof Liquids]: number;
      } & {
        readonly totalLiquids: number;
        readonly liquidCapacity: number;
      }
    > {}

  interface ItemHolder
    extends WithSymbols<
      {
        readonly [I in keyof typeof Items]: number;
      } & {
        readonly totalItems: number;
        readonly firstItem?: ItemSymbol;
        readonly itemCapacity: number;
      }
    > {}

  interface PowerHolder
    extends WithSymbols<{
      readonly totalPower: number;
      readonly powerCapacity: number;
      readonly powerNetStored: number;
      readonly powerNetCapacity: number;
      readonly powerNetIn: number;
      readonly powerNetOut: number;
    }> {}

  interface Shooting
    extends WithSymbols<{
      readonly shooting: boolean;
      readonly shootX: number;
      readonly shootY: number;
      readonly ammo: number;
      readonly ammoCapacity: number;
    }> {}

  interface WithHealth
    extends WithSymbols<{
      readonly health: number;
      readonly maxHealth: number;
      readonly dead: boolean;
    }> {}

  interface Heatable
    extends WithSymbols<{
      readonly heat: number;
    }> {}

  interface WithEffiency
    extends WithSymbols<{
      readonly efficiency: number;
    }> {}

  interface WithProgress
    extends WithSymbols<{
      readonly progress: number;
    }> {}

  interface WithTimescale
    extends WithSymbols<{
      readonly timescale: number;
    }> {}

  interface Rotatable
    extends WithSymbols<{
      readonly rotation: number;
    }> {}

  interface Spaced
    extends WithSymbols<{
      readonly x: number;
      readonly y: number;
      readonly size: number;
    }> {}

  interface Ranged
    extends WithSymbols<{
      readonly range: number;
    }> {}

  interface Boosted
    extends WithSymbols<{
      readonly boosting: boolean;
    }> {}

  interface Mining
    extends WithSymbols<{
      readonly mineX: number;
      readonly mineY: number;
      readonly mining: number;
    }> {}

  interface Typed<T extends symbol = symbol>
    extends WithSymbols<{
      readonly type: T;
    }> {}
  interface Flagged
    extends WithSymbols<{
      readonly flag: number;
    }> {}

  interface Controllable
    extends WithSymbols<{
      readonly controlled: 0 | ControlKind;
      readonly controller: AnyUnit | BasicBuilding;
    }> {}

  interface Nameable
    extends WithSymbols<{
      readonly name?: string;
    }> {}

  interface PayloadHolder
    extends WithSymbols<{
      readonly payloadCount: number;
      readonly payloadType?: symbol;
    }> {}

  interface WithEnable
    extends WithSymbols<{
      enabled: boolean;
    }> {}
  interface WithConfig<
    T extends symbol | number | undefined = symbol | undefined
  > extends WithSymbols<{
      readonly config: T;
    }> {}

  interface WithSpeed
    extends WithSymbols<{
      speed: number;
    }> {}

  interface WithColor
    extends WithSymbols<{
      color: number;
    }> {}

  interface WithTeam
    extends WithSymbols<{
      team: number;
    }> {}
}
