unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

if (!shooting) endScript();

const unit = spawnUnit(Units.eclipse, shootX, shootY, Teams.malis);

print`available health: ${unit.health}`;
printFlush();
