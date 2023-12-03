import { explosion } from "mlogjs:world";

unitBind(Units.gamma);

const { shootX, shootY, shooting } = Vars.unit;

if (!shooting) endScript();

explosion({
  team: Teams.sharded,
  x: shootX,
  y: shootY,
  radius: 5,
  damage: 10,
  air: true,
  ground: true,
  pierce: true,
});
