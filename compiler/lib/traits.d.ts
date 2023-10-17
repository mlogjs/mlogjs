import "./globals";

type LogicSymbols = typeof Items & typeof Liquids & typeof LAccess;

export type WithSymbols<T extends Record<string, unknown>> = T & {
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
      /** The amount of power stored in this building. */
      readonly totalPower: number;
      /** The maximum amount of power this building can hold. */
      readonly powerCapacity: number;
      /**
       * The amount of power stored in the power net that is this building is a
       * part of.
       */
      readonly powerNetStored: number;
      /**
       * The maximum amount of power that can be stored in the power net that is
       * this building is a part of.
       */
      readonly powerNetCapacity: number;
      /**
       * How much power is being generated in the power net that is this
       * building is a part of.
       */
      readonly powerNetIn: number;
      /**
       * How much power is being spent in the power net that is this building is
       * a part of.
       */
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
      /**
       * Can mean:
       *
       * - The damage buildup in the force field of force projectors. This buildup
       *   decreases over time as the force projector regenerates.
       * - The warmup progress of impact reactors, in the range: [0, 1].
       * - The heat of a thorium reactor, in the range: [0, 1].
       */
      readonly heat: number;
    }> {}

  interface WithShield
    extends WithSymbols<{
      /**
       * The amount of shield hp `this` has.
       *
       * If `this` has a force field, returns the force field's hp.
       *
       * Or else, if `this` is an unit, returns the hp of this unit's personal
       * shield, which is as one given by a `pulsar`.
       */
      readonly shield: number;
    }> {}

  interface WithEffiency
    extends WithSymbols<{
      readonly efficiency: number;
    }> {}

  interface WithProgress
    extends WithSymbols<{
      /**
       * Action progress, in the range: [0, 1].
       *
       * Returns the production, turret reload or construction progress.
       */
      readonly progress: number;
    }> {}

  interface WithTimescale
    extends WithSymbols<{
      /**
       * The speed boost applied to this building by, for example, an overdrive
       * projector.
       */
      readonly timescale: number;
    }> {}

  interface Rotatable
    extends WithSymbols<{
      /**
       * The rotation of this entity.
       *
       * Most buildings have their rotation represented by an integer within the
       * range [0, 3]. With each meaning:
       *
       * - 0 => right
       * - 1 => up
       * - 2 => left
       * - 3 => down
       *
       * While units and some other buildings (like turrets) will have their
       * rotation represented in degrees stored in a floating point number.
       */
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
      /**
       * The type of control that is being applied to `this`.
       *
       * If `this` is a building:
       *
       * - `ControlKind.ctrlPlayer` if a player is controlling `this`.
       * - `0` otherwise.
       *
       * If `this` is an unit:
       *
       * - `ControlKind.ctrlProcessor` if `this` is being controlled by a
       *   processor.
       * - `ControlKind.ctrlPlayer` if `this` is being controlled directly by a
       *   player.
       * - `ControlKind.ctrlCommand` if `this` is being controlled by player
       *   commands.
       * - `0` otherwise.
       */
      readonly controlled: 0 | ControlKind;
      /**
       * The entity controlling this unit. Is either a player, a processor or
       * `this`.
       */
      readonly controller: AnyUnit | BasicBuilding;
    }> {}

  interface Nameable
    extends WithSymbols<{
      /** The name of the player controlling this unit. */
      readonly name?: string;
    }> {}

  interface PayloadHolder
    extends WithSymbols<{
      readonly payloadCount: number;
      readonly payloadType?: UnitSymbol | BlockSymbol;
    }> {}

  interface WithEnable
    extends WithSymbols<{
      enabled: boolean;
    }> {}
  interface WithConfig<
    T extends symbol | number | undefined = symbol | undefined,
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
