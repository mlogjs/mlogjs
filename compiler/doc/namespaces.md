# Namespaces

The following namespaces allow you to safely access processor symbols or variables.

## ControlKind

This is actually an enum that serves the same purpose as the other namespaces. Gives you direct access to symbols such as `@ctrlPlayer`, `@ctrlProcessor` and `@ctrlFormation`.

- `ctrlPlayer`
- `ctrlProcessor`
- `ctrlFormation`

## Vars

Allows you to access processor variables.

- `this` - The current processor.
- `thisx` - The x coordinates of this processor.
- `thisy` - The y coordinates of this processor.
- `mapw` - The width of the map.
- `maph` - The height of the map.
- `links` - The number of blocks linked to this processor.
- `unit` - The unit currently bound to this processor.

## Items

Contains all items available

- `copper`
- `lead`
- `metaglass`
- `graphite`
- `sand`
- `coal`
- `titanium`
- `thorium`
- `scrap`
- `silicon`
- `plastanium`
- `phaseFabric`
- `surgeAlloy`
- `sporePod`
- `blastCompound`
- `pyratite`

## Liquids

Contains all items available

- `water`
- `slag`
- `oil`
- `cryofluid`

## Units

Contains all units available

- `dagger`
- `mace`
- `fortress`
- `scepter`
- `reign`
- `nova`
- `pulsar`
- `quasar`
- `vela`
- `corvus`
- `crawler`
- `atrax`
- `spiroct`
- `arkyid`
- `toxopid`
- `flare`
- `horizon`
- `zenith`
- `antumbra`
- `eclipse`
- `mono`
- `poly`
- `mega`
- `quad`
- `oct`
- `risso`
- `minke`
- `bryde`
- `sei`
- `omura`
- `retusa`
- `oxynoe`
- `cyerce`
- `aegires`
- `navanax`
- `alpha`
- `beta`
- `gamma`

## LAccess

This namespace contains all symbols that can be used to access properties of entities via the `sense` command. Although it exists you will more likely use the [object property notation](/macros#sensing-properties-of-entities)

- `totalItems`
- `firstItem`
- `totalLiquids`
- `totalPower`
- `itemCapacity`
- `liquidCapacity`
- `powerCapacity`
- `powerNetStored`
- `powerNetCapacity`
- `powerNetIn`
- `powerNetOut`
- `ammo`
- `ammoCapacity`
- `health`
- `maxHealth`
- `heat`
- `efficiency`
- `progress`
- `timescale`
- `rotation`
- `x`
- `y`
- `shootX`
- `shootY`
- `size`
- `dead`
- `range`
- `shooting`
- `boosting`
- `mineX`
- `mineY`
- `mining`
- `team`
- `type`
- `flag`
- `controlled`
- `controller`
- `commanded`
- `name`
- `payloadCount`
- `payloadType`
- `enabled`
- `shoot`
- `shootp`
- `config`
- `color`

## UnitCommands

Contains the possible config values for a command center.

- `attack`
- `rally`
- `idle`

## Blocks

Contains the available symbols for blocks.

- `air`
- `solid`
- `siliconSmelter`
- `siliconCrucible`
- `kiln`
- `graphitePress`
- `plastaniumCompressor`
- `multiPress`
- `phaseWeaver`
- `surgeSmelter`
- `pyratiteMixer`
- `blastMixer`
- `cryofluidMixer`
- `melter`
- `separator`
- `disassembler`
- `sporePress`
- `pulverizer`
- `incinerator`
- `coalCentrifuge`
- `powerSource`
- `powerVoid`
- `itemSource`
- `itemVoid`
- `liquidSource`
- `liquidVoid`
- `payloadSource`
- `payloadVoid`
- `illuminator`
- `copperWall`
- `copperWallLarge`
- `titaniumWall`
- `titaniumWallLarge`
- `plastaniumWall`
- `plastaniumWallLarge`
- `thoriumWall`
- `thoriumWallLarge`
- `door`
- `doorLarge`
- `phaseWall`
- `phaseWallLarge`
- `surgeWall`
- `surgeWallLarge`
- `mender`
- `mendProjector`
- `overdriveProjector`
- `overdriveDome`
- `forceProjector`
- `shockMine`
- `scrapWall`
- `scrapWallLarge`
- `scrapWallHuge`
- `scrapWallGigantic`
- `thruster`
- `conveyor`
- `titaniumConveyor`
- `plastaniumConveyor`
- `armoredConveyor`
- `distributor`
- `junction`
- `itemBridge`
- `phaseConveyor`
- `sorter`
- `invertedSorter`
- `router`
- `overflowGate`
- `underflowGate`
- `massDriver`
- `duct`
- `ductRouter`
- `ductBridge`
- `mechanicalPump`
- `rotaryPump`
- `thermalPump`
- `conduit`
- `pulseConduit`
- `platedConduit`
- `liquidRouter`
- `liquidContainer`
- `liquidTank`
- `liquidJunction`
- `bridgeConduit`
- `phaseConduit`
- `combustionGenerator`
- `thermalGenerator`
- `steamGenerator`
- `differentialGenerator`
- `rtgGenerator`
- `solarPanel`
- `largeSolarPanel`
- `thoriumReactor`
- `impactReactor`
- `battery`
- `batteryLarge`
- `powerNode`
- `powerNodeLarge`
- `surgeTower`
- `diode`
- `mechanicalDrill`
- `pneumaticDrill`
- `laserDrill`
- `blastDrill`
- `waterExtractor`
- `oilExtractor`
- `cultivator`
- `coreShard`
- `coreFoundation`
- `coreNucleus`
- `vault`
- `container`
- `unloader`
- `duo`
- `scatter`
- `scorch`
- `hail`
- `arc`
- `wave`
- `lancer`
- `swarmer`
- `salvo`
- `fuse`
- `ripple`
- `cyclone`
- `foreshadow`
- `spectre`
- `meltdown`
- `segment`
- `parallax`
- `tsunami`
- `commandCenter`
- `groundFactory`
- `airFactory`
- `navalFactory`
- `additiveReconstructor`
- `multiplicativeReconstructor`
- `exponentialReconstructor`
- `tetrativeReconstructor`
- `repairPoint`
- `repairTurret`
- `payloadConveyor`
- `payloadRouter`
- `payloadPropulsionTower`
- `deconstructor`
- `constructor`
- `largeConstructor`
- `payloadLoader`
- `payloadUnloader`
- `message`
- `switchBlock`
- `microProcessor`
- `logicProcessor`
- `hyperProcessor`
- `largeLogicDisplay`
- `logicDisplay`
- `memoryCell`
- `memoryBank`
- `launchPad`
- `interplanetaryAccelerator`
