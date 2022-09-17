unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

if (!shooting) endScript();

spawnWave(false, shootX, shootY);
