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

print`available health: ${unit.health}`;
printFlush();
