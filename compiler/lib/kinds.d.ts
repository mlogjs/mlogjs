/// <reference path="./traits.d.ts" />

interface BasicUnit
  extends
    ItemHolder,
    Shooting,
    WithHealth,
    WithShield,
    Rotatable,
    Spaced,
    Ranged,
    Mining,
    WithBuild,
    Flying,
    Typed<UnitSymbol>,
    Flagged,
    Controlled,
    WithController,
    Nameable,
    PayloadHolder,
    WithSpeed,
    WithColor,
    WithTeam,
    WithArmor,
    WithVelocity {}

interface AnyUnit extends BasicUnit, Boosted, WithCamera {}

interface BasicBuilding
  extends
    LiquidHolder,
    ItemHolder,
    PowerHolder,
    WithHealth,
    WithEffiency,
    WithTimescale,
    Rotatable,
    Spaced,
    Ranged,
    Typed<BuildingSymbol>,
    Controlled,
    PayloadHolder,
    WithEnable,
    WithConfig,
    WithColor,
    WithTeam,
    WithSolid,
    WithMaxUnits {}

interface BasicTurret extends BasicBuilding, Shooting, WithProgress {}

// just to make this future proof
interface AnyTurret extends BasicTurret {}

interface AnyBuilding
  extends
    AnyTurret,
    Heatable,
    WithShield,
    WithMemory,
    WithBufferSize,
    WithDisplay,
    WithOperations {}

interface Bullet
  extends
    Rotatable,
    WithHealth,
    Spaced,
    WithVelocity,
    WithTeam,
    Ranged,
    WithAim,
    WithSpeed,
    WithColor,
    WithBulletTime {}
