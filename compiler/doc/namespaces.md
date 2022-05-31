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
- `itemCount` - Total amount of items existent, can be used to check if an item ID is valid
- `liquidCount` - Total amount of liquids existent, can be used to check if a liquid ID is valid
- `unitCount` - Total amount of units existent, can be used to check if an unit ID is valid
- `blockCount` - Total amount of blocks existent, can be used to check if a block ID is valid
- `tick` - The amount of ticks that happened since the map started
- `time` - The current UNIX timestamp in milliseconds

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

This namespace contains all symbols that can be used to access properties of entities via the `sense` command. Although it exists you will more likely use the [object property notation](/data-types#senseable)

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
- `graphitePress`
- `multiPress`
- `siliconSmelter`
- `siliconCrucible`
- `kiln`
- `plastaniumCompressor`
- `phaseWeaver`
- `alloySmelter`
- `cryofluidMixer`
- `pyratiteMixer`
- `blastMixer`
- `melter`
- `separator`
- `disassembler`
- `sporePress`
- `pulverizer`
- `coalCentrifuge`
- `incinerator`
- `copperWall`
- `copperWallLarge`
- `titaniumWall`
- `titaniumWallLarge`
- `plastaniumWall`
- `plastaniumWallLarge`
- `thoriumWall`
- `thoriumWallLarge`
- `phaseWall`
- `phaseWallLarge`
- `surgeWall`
- `surgeWallLarge`
- `door`
- `doorLarge`
- `scrapWall`
- `scrapWallLarge`
- `scrapWallHuge`
- `scrapWallGigantic`
- `thruster`
- `mender`
- `mendProjector`
- `overdriveProjector`
- `overdriveDome`
- `forceProjector`
- `shockMine`
- `conveyor`
- `titaniumConveyor`
- `plastaniumConveyor`
- `armoredConveyor`
- `junction`
- `bridgeConveyor`
- `phaseConveyor`
- `sorter`
- `invertedSorter`
- `router`
- `distributor`
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
- `powerNode`
- `powerNodeLarge`
- `surgeTower`
- `diode`
- `battery`
- `batteryLarge`
- `combustionGenerator`
- `thermalGenerator`
- `steamGenerator`
- `differentialGenerator`
- `rtgGenerator`
- `solarPanel`
- `solarPanelLarge`
- `thoriumReactor`
- `impactReactor`
- `mechanicalDrill`
- `pneumaticDrill`
- `laserDrill`
- `blastDrill`
- `waterExtractor`
- `cultivator`
- `oilExtractor`
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
- `wave`
- `lancer`
- `arc`
- `parallax`
- `swarmer`
- `salvo`
- `segment`
- `tsunami`
- `fuse`
- `ripple`
- `cyclone`
- `foreshadow`
- `spectre`
- `meltdown`
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
- `powerSource`
- `powerVoid`
- `itemSource`
- `itemVoid`
- `liquidSource`
- `liquidVoid`
- `payloadSource`
- `payloadVoid`
- `illuminator`
- `launchPad`
- `interplanetaryAccelerator`
- `message`
- `switch`
- `microProcessor`
- `logicProcessor`
- `hyperProcessor`
- `memoryCell`
- `memoryBank`
- `logicDisplay`
- `largeLogicDisplay`
