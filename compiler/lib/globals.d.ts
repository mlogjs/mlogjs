/// <reference path="./kinds.d.ts" />

declare enum ControlKind {
  ctrlPlayer,
  ctrlProcessor,
  ctrlFormation,
}

interface Vars {
  /** The processor currently executing this code */
  readonly this: BasicBuilding &
    Typed<
      | typeof Blocks.microProcessor
      | typeof Blocks.logicProcessor
      | typeof Blocks.hyperProcessor
    >;
  /** The position on the x axis of this processor */
  readonly thisx: number;
  /** The position on the y axis of this processor */
  readonly thisy: number;
  /** The width of the map */
  readonly mapw: number;
  /** The height of the map */
  readonly maph: number;
  /** The number of blocks linked to this processor */
  readonly links: number;
  /** The amount of instructions run per second */
  readonly ipt: number;
  /** The unit bound to this processor */
  readonly unit: AnyUnit;
}

declare const Vars: Vars;

declare namespace Items {
  const copper: unique symbol;
  const lead: unique symbol;
  const metaglass: unique symbol;
  const graphite: unique symbol;
  const sand: unique symbol;
  const coal: unique symbol;
  const titanium: unique symbol;
  const thorium: unique symbol;
  const scrap: unique symbol;
  const silicon: unique symbol;
  const plastanium: unique symbol;
  const phaseFabric: unique symbol;
  const surgeAlloy: unique symbol;
  const sporePod: unique symbol;
  const blastCompound: unique symbol;
  const pyratite: unique symbol;
}

type ItemSymbol = typeof Items[keyof typeof Items];

declare namespace Liquids {
  const water: unique symbol;
  const slag: unique symbol;
  const oil: unique symbol;
  const cryofluid: unique symbol;
}

type LiquidSymbol = typeof Liquids[keyof typeof Liquids];

declare namespace Units {
  const dagger: unique symbol;
  const mace: unique symbol;
  const fortress: unique symbol;
  const scepter: unique symbol;
  const reign: unique symbol;
  const nova: unique symbol;
  const pulsar: unique symbol;
  const quasar: unique symbol;
  const vela: unique symbol;
  const corvus: unique symbol;
  const crawler: unique symbol;
  const atrax: unique symbol;
  const spiroct: unique symbol;
  const arkyid: unique symbol;
  const toxopid: unique symbol;
  const flare: unique symbol;
  const horizon: unique symbol;
  const zenith: unique symbol;
  const antumbra: unique symbol;
  const eclipse: unique symbol;
  const mono: unique symbol;
  const poly: unique symbol;
  const mega: unique symbol;
  const quad: unique symbol;
  const oct: unique symbol;
  const risso: unique symbol;
  const minke: unique symbol;
  const bryde: unique symbol;
  const sei: unique symbol;
  const omura: unique symbol;
  const retusa: unique symbol;
  const oxynoe: unique symbol;
  const cyerce: unique symbol;
  const aegires: unique symbol;
  const navanax: unique symbol;
  const alpha: unique symbol;
  const beta: unique symbol;
  const gamma: unique symbol;
}

type UnitSymbol = typeof Units[keyof typeof Units];

declare namespace LAccess {
  const totalItems: unique symbol;
  const firstItem: unique symbol;
  const totalLiquids: unique symbol;
  const totalPower: unique symbol;
  const itemCapacity: unique symbol;
  const liquidCapacity: unique symbol;
  const powerCapacity: unique symbol;
  const powerNetStored: unique symbol;
  const powerNetCapacity: unique symbol;
  const powerNetIn: unique symbol;
  const powerNetOut: unique symbol;
  const ammo: unique symbol;
  const ammoCapacity: unique symbol;
  const health: unique symbol;
  const maxHealth: unique symbol;
  const heat: unique symbol;
  const efficiency: unique symbol;
  const progress: unique symbol;
  const timescale: unique symbol;
  const rotation: unique symbol;
  const x: unique symbol;
  const y: unique symbol;
  const shootX: unique symbol;
  const shootY: unique symbol;
  const size: unique symbol;
  const dead: unique symbol;
  const range: unique symbol;
  const shooting: unique symbol;
  const boosting: unique symbol;
  const mineX: unique symbol;
  const mineY: unique symbol;
  const mining: unique symbol;
  const team: unique symbol;
  const type: unique symbol;
  const flag: unique symbol;
  const controlled: unique symbol;
  const controller: unique symbol;
  const commanded: unique symbol;
  const name: unique symbol;
  const payloadCount: unique symbol;
  const payloadType: unique symbol;
  const enabled: unique symbol;
  const shoot: unique symbol;
  const shootp: unique symbol;
  const config: unique symbol;
  const color: unique symbol;
}

declare namespace UnitCommands {
  const attack: unique symbol;
  const rally: unique symbol;
  const idle: unique symbol;
}

type UnitCommandSymbol = typeof UnitCommands[keyof typeof UnitCommands];

declare namespace Blocks {
  // special "blocks" to reference stuff from the environment
  const air: unique symbol;
  const solid: unique symbol;

  const siliconSmelter: unique symbol;
  const siliconCrucible: unique symbol;
  const kiln: unique symbol;
  const graphitePress: unique symbol;
  const plastaniumCompressor: unique symbol;
  const multiPress: unique symbol;
  const phaseWeaver: unique symbol;
  const surgeSmelter: unique symbol;
  const pyratiteMixer: unique symbol;
  const blastMixer: unique symbol;
  const cryofluidMixer: unique symbol;
  const melter: unique symbol;
  const separator: unique symbol;
  const disassembler: unique symbol;
  const sporePress: unique symbol;
  const pulverizer: unique symbol;
  const incinerator: unique symbol;
  const coalCentrifuge: unique symbol;
  const powerSource: unique symbol;
  const powerVoid: unique symbol;
  const itemSource: unique symbol;
  const itemVoid: unique symbol;
  const liquidSource: unique symbol;
  const liquidVoid: unique symbol;
  const payloadSource: unique symbol;
  const payloadVoid: unique symbol;
  const illuminator: unique symbol;
  const copperWall: unique symbol;
  const copperWallLarge: unique symbol;
  const titaniumWall: unique symbol;
  const titaniumWallLarge: unique symbol;
  const plastaniumWall: unique symbol;
  const plastaniumWallLarge: unique symbol;
  const thoriumWall: unique symbol;
  const thoriumWallLarge: unique symbol;
  const door: unique symbol;
  const doorLarge: unique symbol;
  const phaseWall: unique symbol;
  const phaseWallLarge: unique symbol;
  const surgeWall: unique symbol;
  const surgeWallLarge: unique symbol;
  const mender: unique symbol;
  const mendProjector: unique symbol;
  const overdriveProjector: unique symbol;
  const overdriveDome: unique symbol;
  const forceProjector: unique symbol;
  const shockMine: unique symbol;
  const scrapWall: unique symbol;
  const scrapWallLarge: unique symbol;
  const scrapWallHuge: unique symbol;
  const scrapWallGigantic: unique symbol;
  const thruster: unique symbol;
  const conveyor: unique symbol;
  const titaniumConveyor: unique symbol;
  const plastaniumConveyor: unique symbol;
  const armoredConveyor: unique symbol;
  const distributor: unique symbol;
  const junction: unique symbol;
  const itemBridge: unique symbol;
  const phaseConveyor: unique symbol;
  const sorter: unique symbol;
  const invertedSorter: unique symbol;
  const router: unique symbol;
  const overflowGate: unique symbol;
  const underflowGate: unique symbol;
  const massDriver: unique symbol;
  const duct: unique symbol;
  const ductRouter: unique symbol;
  const ductBridge: unique symbol;
  const mechanicalPump: unique symbol;
  const rotaryPump: unique symbol;
  const thermalPump: unique symbol;
  const conduit: unique symbol;
  const pulseConduit: unique symbol;
  const platedConduit: unique symbol;
  const liquidRouter: unique symbol;
  const liquidContainer: unique symbol;
  const liquidTank: unique symbol;
  const liquidJunction: unique symbol;
  const bridgeConduit: unique symbol;
  const phaseConduit: unique symbol;
  const combustionGenerator: unique symbol;
  const thermalGenerator: unique symbol;
  const steamGenerator: unique symbol;
  const differentialGenerator: unique symbol;
  const rtgGenerator: unique symbol;
  const solarPanel: unique symbol;
  const largeSolarPanel: unique symbol;
  const thoriumReactor: unique symbol;
  const impactReactor: unique symbol;
  const battery: unique symbol;
  const batteryLarge: unique symbol;
  const powerNode: unique symbol;
  const powerNodeLarge: unique symbol;
  const surgeTower: unique symbol;
  const diode: unique symbol;
  const mechanicalDrill: unique symbol;
  const pneumaticDrill: unique symbol;
  const laserDrill: unique symbol;
  const blastDrill: unique symbol;
  const waterExtractor: unique symbol;
  const oilExtractor: unique symbol;
  const cultivator: unique symbol;
  const coreShard: unique symbol;
  const coreFoundation: unique symbol;
  const coreNucleus: unique symbol;
  const vault: unique symbol;
  const container: unique symbol;
  const unloader: unique symbol;
  const duo: unique symbol;
  const scatter: unique symbol;
  const scorch: unique symbol;
  const hail: unique symbol;
  const arc: unique symbol;
  const wave: unique symbol;
  const lancer: unique symbol;
  const swarmer: unique symbol;
  const salvo: unique symbol;
  const fuse: unique symbol;
  const ripple: unique symbol;
  const cyclone: unique symbol;
  const foreshadow: unique symbol;
  const spectre: unique symbol;
  const meltdown: unique symbol;
  const segment: unique symbol;
  const parallax: unique symbol;
  const tsunami: unique symbol;
  const commandCenter: unique symbol;
  const groundFactory: unique symbol;
  const airFactory: unique symbol;
  const navalFactory: unique symbol;
  const additiveReconstructor: unique symbol;
  const multiplicativeReconstructor: unique symbol;
  const exponentialReconstructor: unique symbol;
  const tetrativeReconstructor: unique symbol;
  const repairPoint: unique symbol;
  const repairTurret: unique symbol;
  const payloadConveyor: unique symbol;
  const payloadRouter: unique symbol;
  const payloadPropulsionTower: unique symbol;
  const deconstructor: unique symbol;
  const constructor: unique symbol;
  const largeConstructor: unique symbol;
  const payloadLoader: unique symbol;
  const payloadUnloader: unique symbol;
  const message: unique symbol;
  const switchBlock: unique symbol;
  const microProcessor: unique symbol;
  const logicProcessor: unique symbol;
  const hyperProcessor: unique symbol;
  const largeLogicDisplay: unique symbol;
  const logicDisplay: unique symbol;
  const memoryCell: unique symbol;
  const memoryBank: unique symbol;
  const launchPad: unique symbol;
  const interplanetaryAccelerator: unique symbol;
}

type BlockSymbol = typeof Blocks[keyof typeof Blocks];
