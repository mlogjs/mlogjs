unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

// TODO: !shooting doesn't work
if (shooting == false) endScript();

const unit = spawnUnit(Units.eclipse, shootX, shootY, Teams.malis);

print`available health: ${unit.health}`;
printFlush();
