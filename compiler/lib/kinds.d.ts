/// <reference path="./traits.d.ts" />

interface BasicUnit
  extends ItemHolder,
    Shooting,
    WithHealth,
    WithShield,
    Rotatable,
    Spaced,
    Ranged,
    Mining,
    Typed<UnitSymbol>,
    Flagged,
    Controlled,
    WithController,
    Nameable,
    PayloadHolder,
    WithSpeed,
    WithColor,
    WithTeam {}

interface AnyUnit extends BasicUnit, Boosted {}

interface BasicBuilding
  extends LiquidHolder,
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
    WithTeam {}

interface BasicTurret extends BasicBuilding, Shooting, WithProgress {}

// just to make this future proof
interface AnyTurret extends BasicTurret {}

interface AnyBuilding extends AnyTurret, Heatable, WithShield {}
