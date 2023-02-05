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
  /** The amount of ticks that happened since the map started*/
  readonly tick: number;
  /** The current UNIX timestamp in milliseconds */
  readonly time: number;
  /**
   * The amount of seconds that passed since the map started.
   *
   * This number is NOT an integer, use `Math.floor` to get the number
   * of whole seconds that already passed.
   */
  readonly second: number;
  /**
   * The amount of minutes that passed since the map started.
   *
   * This number is NOT an integer, use `Math.floor` to get the number
   * of whole minutes that already passed.
   */
  readonly minute: number;
  /** The number of the current wave. Starts at 1. */
  readonly waveNumber: number;
  /**
   * The amount of seconds left before the next wave.
   *
   * This number is NOT an integer, use `Math.floor` to get the number
   * of whole seconds left.
   */
  readonly waveTime: number;
  /** Total amount of items existent, can be used to check if an ID is valid*/
  readonly itemCount: number;
  /** Total amount of liquids existent, can be used to check if an ID is valid*/
  readonly liquidCount: number;
  /** Total amount of units existent, can be used to check if an ID is valid*/
  readonly unitCount: number;
  /** Total amount of blocks existent, can be used to check if an ID is valid*/
  readonly blockCount: number;
}

declare const Vars: Vars;

/** Contains the base game teams. */
declare namespace Teams {
  /** The gray team. */
  const derelict: unique symbol;
  /** The yellow team. */
  const sharded: unique symbol;
  /** The red team. */
  const crux: unique symbol;
  /** The purple team. */
  const malis: unique symbol;
  /**
   * The green team.
   *
   * Warning: this name might change in the future.
   */
  const green: unique symbol;
  /**
   * The blue team.
   *
   * Warning: this name might change in the future.
   */
  const blue: unique symbol;
}

type TeamSymbol = (typeof Teams)[keyof typeof Teams];

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
  const beryllium: unique symbol;
  const tungsten: unique symbol;
  const oxide: unique symbol;
  const carbide: unique symbol;
  const fissileMatter: unique symbol;
  const dormantCyst: unique symbol;
}

type ItemSymbol = (typeof Items)[keyof typeof Items];

declare namespace Liquids {
  const water: unique symbol;
  const slag: unique symbol;
  const oil: unique symbol;
  const cryofluid: unique symbol;
  const neoplasm: unique symbol;
  const arkycite: unique symbol;
  const gallium: unique symbol;
  const ozone: unique symbol;
  const hydrogen: unique symbol;
  const nitrogen: unique symbol;
  const cyanogen: unique symbol;
}

type LiquidSymbol = (typeof Liquids)[keyof typeof Liquids];

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
  const stell: unique symbol;
  const locus: unique symbol;
  const precept: unique symbol;
  const vanquish: unique symbol;
  const conquer: unique symbol;
  const merui: unique symbol;
  const cleroi: unique symbol;
  const anthicus: unique symbol;
  const tecta: unique symbol;
  const collaris: unique symbol;
  const elude: unique symbol;
  const avert: unique symbol;
  const obviate: unique symbol;
  const quell: unique symbol;
  const disrupt: unique symbol;
  const renale: unique symbol;
  const latum: unique symbol;
  const evoke: unique symbol;
  const incite: unique symbol;
  const emanate: unique symbol;
  const block: unique symbol;
  const manifold: unique symbol;
  const assemblyDrone: unique symbol;
}

type UnitSymbol = (typeof Units)[keyof typeof Units];

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
  const speed: unique symbol;
  const team: unique symbol;
  const type: unique symbol;
  const flag: unique symbol;
  const controlled: unique symbol;
  const controller: unique symbol;
  const name: unique symbol;
  const payloadCount: unique symbol;
  const payloadType: unique symbol;
  const enabled: unique symbol;
  const config: unique symbol;
  const color: unique symbol;
}

interface BuildingSymbolTable {
  readonly graphitePress: unique symbol;
  readonly multiPress: unique symbol;
  readonly siliconSmelter: unique symbol;
  readonly siliconCrucible: unique symbol;
  readonly kiln: unique symbol;
  readonly plastaniumCompressor: unique symbol;
  readonly phaseWeaver: unique symbol;
  readonly surgeSmelter: unique symbol;
  readonly cryofluidMixer: unique symbol;
  readonly pyratiteMixer: unique symbol;
  readonly blastMixer: unique symbol;
  readonly melter: unique symbol;
  readonly separator: unique symbol;
  readonly disassembler: unique symbol;
  readonly sporePress: unique symbol;
  readonly pulverizer: unique symbol;
  readonly coalCentrifuge: unique symbol;
  readonly incinerator: unique symbol;
  readonly siliconArcFurnace: unique symbol;
  readonly electrolyzer: unique symbol;
  readonly atmosphericConcentrator: unique symbol;
  readonly oxidationChamber: unique symbol;
  readonly electricHeater: unique symbol;
  readonly slagHeater: unique symbol;
  readonly phaseHeater: unique symbol;
  readonly heatRedirector: unique symbol;
  readonly heatRouter: unique symbol;
  readonly slagIncinerator: unique symbol;
  readonly carbideCrucible: unique symbol;
  readonly slagCentrifuge: unique symbol;
  readonly surgeCrucible: unique symbol;
  readonly cyanogenSynthesizer: unique symbol;
  readonly phaseSynthesizer: unique symbol;
  readonly heatReactor: unique symbol;
  readonly copperWall: unique symbol;
  readonly copperWallLarge: unique symbol;
  readonly titaniumWall: unique symbol;
  readonly titaniumWallLarge: unique symbol;
  readonly plastaniumWall: unique symbol;
  readonly plastaniumWallLarge: unique symbol;
  readonly thoriumWall: unique symbol;
  readonly thoriumWallLarge: unique symbol;
  readonly phaseWall: unique symbol;
  readonly phaseWallLarge: unique symbol;
  readonly surgeWall: unique symbol;
  readonly surgeWallLarge: unique symbol;
  readonly door: unique symbol;
  readonly doorLarge: unique symbol;
  readonly scrapWall: unique symbol;
  readonly scrapWallLarge: unique symbol;
  readonly scrapWallHuge: unique symbol;
  readonly scrapWallGigantic: unique symbol;
  readonly thruster: unique symbol;
  readonly berylliumWall: unique symbol;
  readonly berylliumWallLarge: unique symbol;
  readonly tungstenWall: unique symbol;
  readonly tungstenWallLarge: unique symbol;
  readonly blastDoor: unique symbol;
  readonly reinforcedSurgeWall: unique symbol;
  readonly reinforcedSurgeWallLarge: unique symbol;
  readonly carbideWall: unique symbol;
  readonly carbideWallLarge: unique symbol;
  readonly shieldedWall: unique symbol;
  readonly mender: unique symbol;
  readonly mendProjector: unique symbol;
  readonly overdriveProjector: unique symbol;
  readonly overdriveDome: unique symbol;
  readonly forceProjector: unique symbol;
  readonly shockMine: unique symbol;
  readonly radar: unique symbol;
  readonly buildTower: unique symbol;
  readonly regenProjector: unique symbol;
  readonly barrierProjector: unique symbol;
  readonly shockwaveTower: unique symbol;
  readonly shieldProjector: unique symbol;
  readonly largeShieldProjector: unique symbol;
  readonly conveyor: unique symbol;
  readonly titaniumConveyor: unique symbol;
  readonly plastaniumConveyor: unique symbol;
  readonly armoredConveyor: unique symbol;
  readonly junction: unique symbol;
  readonly bridgeConveyor: unique symbol;
  readonly phaseConveyor: unique symbol;
  readonly sorter: unique symbol;
  readonly invertedSorter: unique symbol;
  readonly router: unique symbol;
  readonly distributor: unique symbol;
  readonly overflowGate: unique symbol;
  readonly underflowGate: unique symbol;
  readonly massDriver: unique symbol;
  readonly duct: unique symbol;
  readonly armoredDuct: unique symbol;
  readonly ductRouter: unique symbol;
  readonly overflowDuct: unique symbol;
  readonly underflowDuct: unique symbol;
  readonly ductBridge: unique symbol;
  readonly ductUnloader: unique symbol;
  readonly surgeConveyor: unique symbol;
  readonly surgeRouter: unique symbol;
  readonly unitCargoLoader: unique symbol;
  readonly unitCargoUnloadPoint: unique symbol;
  readonly mechanicalPump: unique symbol;
  readonly rotaryPump: unique symbol;
  readonly impulsePump: unique symbol;
  readonly conduit: unique symbol;
  readonly pulseConduit: unique symbol;
  readonly platedConduit: unique symbol;
  readonly liquidRouter: unique symbol;
  readonly liquidContainer: unique symbol;
  readonly liquidTank: unique symbol;
  readonly liquidJunction: unique symbol;
  readonly bridgeConduit: unique symbol;
  readonly phaseConduit: unique symbol;
  readonly reinforcedPump: unique symbol;
  readonly reinforcedConduit: unique symbol;
  readonly reinforcedLiquidJunction: unique symbol;
  readonly reinforcedBridgeConduit: unique symbol;
  readonly reinforcedLiquidRouter: unique symbol;
  readonly reinforcedLiquidContainer: unique symbol;
  readonly reinforcedLiquidTank: unique symbol;
  readonly powerNode: unique symbol;
  readonly powerNodeLarge: unique symbol;
  readonly surgeTower: unique symbol;
  readonly diode: unique symbol;
  readonly battery: unique symbol;
  readonly batteryLarge: unique symbol;
  readonly combustionGenerator: unique symbol;
  readonly thermalGenerator: unique symbol;
  readonly steamGenerator: unique symbol;
  readonly differentialGenerator: unique symbol;
  readonly rtgGenerator: unique symbol;
  readonly solarPanel: unique symbol;
  readonly solarPanelLarge: unique symbol;
  readonly thoriumReactor: unique symbol;
  readonly impactReactor: unique symbol;
  readonly beamNode: unique symbol;
  readonly beamTower: unique symbol;
  readonly beamLink: unique symbol;
  readonly turbineCondenser: unique symbol;
  readonly chemicalCombustionChamber: unique symbol;
  readonly pyrolysisGenerator: unique symbol;
  readonly fluxReactor: unique symbol;
  readonly neoplasiaReactor: unique symbol;
  readonly mechanicalDrill: unique symbol;
  readonly pneumaticDrill: unique symbol;
  readonly laserDrill: unique symbol;
  readonly blastDrill: unique symbol;
  readonly waterExtractor: unique symbol;
  readonly cultivator: unique symbol;
  readonly oilExtractor: unique symbol;
  readonly ventCondenser: unique symbol;
  readonly cliffCrusher: unique symbol;
  readonly plasmaBore: unique symbol;
  readonly largePlasmaBore: unique symbol;
  readonly impactDrill: unique symbol;
  readonly eruptionDrill: unique symbol;
  readonly coreShard: unique symbol;
  readonly coreFoundation: unique symbol;
  readonly coreNucleus: unique symbol;
  readonly coreBastion: unique symbol;
  readonly coreCitadel: unique symbol;
  readonly coreAcropolis: unique symbol;
  readonly container: unique symbol;
  readonly vault: unique symbol;
  readonly unloader: unique symbol;
  readonly reinforcedContainer: unique symbol;
  readonly reinforcedVault: unique symbol;
  readonly duo: unique symbol;
  readonly scatter: unique symbol;
  readonly scorch: unique symbol;
  readonly hail: unique symbol;
  readonly wave: unique symbol;
  readonly lancer: unique symbol;
  readonly arc: unique symbol;
  readonly parallax: unique symbol;
  readonly swarmer: unique symbol;
  readonly salvo: unique symbol;
  readonly segment: unique symbol;
  readonly tsunami: unique symbol;
  readonly fuse: unique symbol;
  readonly ripple: unique symbol;
  readonly cyclone: unique symbol;
  readonly foreshadow: unique symbol;
  readonly spectre: unique symbol;
  readonly meltdown: unique symbol;
  readonly breach: unique symbol;
  readonly diffuse: unique symbol;
  readonly sublimate: unique symbol;
  readonly titan: unique symbol;
  readonly disperse: unique symbol;
  readonly afflict: unique symbol;
  readonly lustre: unique symbol;
  readonly scathe: unique symbol;
  readonly smite: unique symbol;
  readonly malign: unique symbol;
  readonly groundFactory: unique symbol;
  readonly airFactory: unique symbol;
  readonly navalFactory: unique symbol;
  readonly additiveReconstructor: unique symbol;
  readonly multiplicativeReconstructor: unique symbol;
  readonly exponentialReconstructor: unique symbol;
  readonly tetrativeReconstructor: unique symbol;
  readonly repairPoint: unique symbol;
  readonly repairTurret: unique symbol;
  readonly payloadConveyor: unique symbol;
  readonly payloadRouter: unique symbol;
  readonly reinforcedPayloadConveyor: unique symbol;
  readonly reinforcedPayloadRouter: unique symbol;
  readonly payloadMassDriver: unique symbol;
  readonly payloadPropulsionTower: unique symbol;
  readonly smallDeconstructor: unique symbol;
  readonly deconstructor: unique symbol;
  readonly constructor: unique symbol;
  readonly largeConstructor: unique symbol;
  readonly payloadLoader: unique symbol;
  readonly payloadUnloader: unique symbol;
  readonly powerSource: unique symbol;
  readonly powerVoid: unique symbol;
  readonly itemSource: unique symbol;
  readonly itemVoid: unique symbol;
  readonly liquidSource: unique symbol;
  readonly liquidVoid: unique symbol;
  readonly payloadSource: unique symbol;
  readonly payloadVoid: unique symbol;
  readonly heatSource: unique symbol;
  readonly illuminator: unique symbol;
  readonly launchPad: unique symbol;
  readonly interplanetaryAccelerator: unique symbol;
  readonly message: unique symbol;
  readonly switch: unique symbol;
  readonly microProcessor: unique symbol;
  readonly logicProcessor: unique symbol;
  readonly hyperProcessor: unique symbol;
  readonly memoryCell: unique symbol;
  readonly memoryBank: unique symbol;
  readonly logicDisplay: unique symbol;
  readonly largeLogicDisplay: unique symbol;
  readonly canvas: unique symbol;
  readonly worldProcessor: unique symbol;
  readonly worldCell: unique symbol;
}

type BuildingSymbol = Blocks[keyof BuildingSymbolTable];

interface EnvBlockSymbolTable {
  // used by some instructions to represent any env block
  readonly solid: EnvBlockSymbolTable["stoneWall"];
  readonly air: unique symbol;
  readonly spawn: unique symbol;
  readonly cliff: unique symbol;
  readonly deepWater: unique symbol;
  readonly shallowWater: unique symbol;
  readonly taintedWater: unique symbol;
  readonly deepTaintedWater: unique symbol;
  readonly darksandTaintedWater: unique symbol;
  readonly sandWater: unique symbol;
  readonly darksandWater: unique symbol;
  readonly tar: unique symbol;
  readonly pooledCryofluid: unique symbol;
  readonly moltenSlag: unique symbol;
  readonly space: unique symbol;
  readonly empty: unique symbol;
  readonly stone: unique symbol;
  readonly craterStone: unique symbol;
  readonly char: unique symbol;
  readonly basalt: unique symbol;
  readonly hotrock: unique symbol;
  readonly magmarock: unique symbol;
  readonly sandFloor: unique symbol;
  readonly darksand: unique symbol;
  readonly dirt: unique symbol;
  readonly mud: unique symbol;
  readonly dacite: unique symbol;
  readonly rhyolite: unique symbol;
  readonly rhyoliteCrater: unique symbol;
  readonly roughRhyolite: unique symbol;
  readonly regolith: unique symbol;
  readonly yellowStone: unique symbol;
  readonly carbonStone: unique symbol;
  readonly ferricStone: unique symbol;
  readonly ferricCraters: unique symbol;
  readonly beryllicStone: unique symbol;
  readonly crystallineStone: unique symbol;
  readonly crystalFloor: unique symbol;
  readonly yellowStonePlates: unique symbol;
  readonly redStone: unique symbol;
  readonly denseRedStone: unique symbol;
  readonly redIce: unique symbol;
  readonly arkyciteFloor: unique symbol;
  readonly arkyicStone: unique symbol;
  readonly rhyoliteVent: unique symbol;
  readonly carbonVent: unique symbol;
  readonly arkyicVent: unique symbol;
  readonly yellowStoneVent: unique symbol;
  readonly redStoneVent: unique symbol;
  readonly crystallineVent: unique symbol;
  readonly redmat: unique symbol;
  readonly bluemat: unique symbol;
  readonly grass: unique symbol;
  readonly salt: unique symbol;
  readonly snow: unique symbol;
  readonly ice: unique symbol;
  readonly iceSnow: unique symbol;
  readonly shale: unique symbol;
  readonly moss: unique symbol;
  readonly coreZone: unique symbol;
  readonly sporeMoss: unique symbol;
  readonly stoneWall: unique symbol;
  readonly sporeWall: unique symbol;
  readonly dirtWall: unique symbol;
  readonly daciteWall: unique symbol;
  readonly iceWall: unique symbol;
  readonly snowWall: unique symbol;
  readonly duneWall: unique symbol;
  readonly regolithWall: unique symbol;
  readonly yellowStoneWall: unique symbol;
  readonly rhyoliteWall: unique symbol;
  readonly carbonWall: unique symbol;
  readonly ferricStoneWall: unique symbol;
  readonly beryllicStoneWall: unique symbol;
  readonly arkyicWall: unique symbol;
  readonly crystallineStoneWall: unique symbol;
  readonly redIceWall: unique symbol;
  readonly redStoneWall: unique symbol;
  readonly redDiamondWall: unique symbol;
  readonly sandWall: unique symbol;
  readonly saltWall: unique symbol;
  readonly shrubs: unique symbol;
  readonly shaleWall: unique symbol;
  readonly sporePine: unique symbol;
  readonly snowPine: unique symbol;
  readonly pine: unique symbol;
  readonly whiteTreeDead: unique symbol;
  readonly whiteTree: unique symbol;
  readonly sporeCluster: unique symbol;
  readonly redweed: unique symbol;
  readonly purBush: unique symbol;
  readonly yellowcoral: unique symbol;
  readonly boulder: unique symbol;
  readonly snowBoulder: unique symbol;
  readonly shaleBoulder: unique symbol;
  readonly sandBoulder: unique symbol;
  readonly daciteBoulder: unique symbol;
  readonly basaltBoulder: unique symbol;
  readonly carbonBoulder: unique symbol;
  readonly ferricBoulder: unique symbol;
  readonly beryllicBoulder: unique symbol;
  readonly yellowStoneBoulder: unique symbol;
  readonly arkyicBoulder: unique symbol;
  readonly crystalCluster: unique symbol;
  readonly vibrantCrystalCluster: unique symbol;
  readonly crystalBlocks: unique symbol;
  readonly crystalOrbs: unique symbol;
  readonly crystallineBoulder: unique symbol;
  readonly redIceBoulder: unique symbol;
  readonly rhyoliteBoulder: unique symbol;
  readonly redStoneBoulder: unique symbol;
  readonly metalFloor: unique symbol;
  readonly metalFloorDamaged: unique symbol;
  readonly metalFloor2: unique symbol;
  readonly metalFloor3: unique symbol;
  readonly metalFloor4: unique symbol;
  readonly metalFloor5: unique symbol;
  readonly darkPanel1: unique symbol;
  readonly darkPanel2: unique symbol;
  readonly darkPanel3: unique symbol;
  readonly darkPanel4: unique symbol;
  readonly darkPanel5: unique symbol;
  readonly darkPanel6: unique symbol;
  readonly darkMetal: unique symbol;
  readonly pebbles: unique symbol;
  readonly tendrils: unique symbol;
}

type EnvBlockSymbol = Blocks[keyof EnvBlockSymbolTable];

interface OreSymbolTable {
  readonly oreCopper: unique symbol;
  readonly oreLead: unique symbol;
  readonly oreScrap: unique symbol;
  readonly oreCoal: unique symbol;
  readonly oreTitanium: unique symbol;
  readonly oreThorium: unique symbol;
  readonly oreBeryllium: unique symbol;
  readonly oreTungsten: unique symbol;
  readonly oreCrystalThorium: unique symbol;
  readonly oreWallThorium: unique symbol;
  readonly oreWallBeryllium: unique symbol;
  readonly graphiticWall: unique symbol;
  readonly oreWallTungsten: unique symbol;
}

type OreSymbol = Blocks[keyof OreSymbolTable];

interface Blocks
  extends BuildingSymbolTable,
    EnvBlockSymbolTable,
    OreSymbolTable {}

type BlockSymbol = Blocks[keyof Blocks];
declare const Blocks: Blocks;
