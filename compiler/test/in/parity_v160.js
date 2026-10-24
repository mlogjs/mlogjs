import { fetch } from "mlogjs:world";

unitBind(Units.flare);
unitControl.deconstruct(10, 20);

const flare0 = fetch.unit(Teams.sharded, 0, Units.flare);
const anyUnit0 = fetch.unit(Teams.sharded, 0);
const flareCount = fetch.unitCount(Teams.sharded, Units.flare);
const totalUnits = fetch.unitCount(Teams.sharded);

const { buildX, buildY, building, breaking, flying } = Vars.unit;
const core = getBuilding("core1");
const maxUnits = core.maxUnits;

const isCommand = Vars.unit.controlled === ControlKind.ctrlCommand;
const dummy = Units.dummy;
const missile = Units.missile;

print`flareCount: ${flareCount} total: ${totalUnits} max: ${maxUnits} cmd: ${isCommand}`;
printFlush();
