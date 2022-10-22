/// <reference path="./traits.d.ts" />

interface BasicUnit
  extends ItemHolder,
    Shooting,
    WithHealth,
    Rotatable,
    Spaced,
    Ranged,
    Typed<UnitSymbol>,
    Flagged,
    Controllable,
    Nameable,
    WithSpeed {}

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
    WithEnable {}

interface BasicTurret extends BasicBuilding, Shooting, WithProgress {}

// just to make this future proof
interface AnyTurret extends BasicTurret {}

interface AnyBuilding extends AnyTurret, Heatable {}
