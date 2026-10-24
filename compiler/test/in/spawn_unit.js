import { spawnUnit } from "mlogjs:world";

unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

if (!shooting) endScript();

const unit = spawnUnit({
  type: Units.eclipse,
  x: shootX,
  y: shootY,
  team: Teams.malis,
});

const silentUnit = spawnUnit({
  type: Units.flare,
  x: shootX,
  y: shootY,
  team: Teams.sharded,
  effect: false,
});

print`available health: ${unit.health} ${silentUnit.health}`;
printFlush();
