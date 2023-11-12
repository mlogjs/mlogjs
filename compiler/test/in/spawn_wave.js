import { spawnWave } from "mlogjs:world";

unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

if (!shooting) endScript();

spawnWave(false, shootX, shootY);
