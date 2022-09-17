unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

if (!shooting) endScript();

explosion(Teams.sharded, shootX, shootY, 5, 10, true, true, true);
