import { spawnBullet, setProp } from "mlogjs:world";

const b1 = spawnBullet({
  from: Blocks.duo,
  x: 10,
  y: 20,
  rotation: 90,
  team: Teams.sharded,
});

const b2 = spawnBullet({
  from: Units.flare,
  x: 30,
  y: 40,
  rotation: 180,
  team: Teams.crux,
  damage: 50,
  velocityScl: 2,
  lifeScl: 1.5,
  aimX: 100,
  aimY: 100,
});

const lifetime = b1.bulletLifetime;
const time = b1.bulletTime;
const damage = b1.health;
const maxDamage = b1.maxHealth;
const aimX = b1.shootX;
const aimY = b1.shootY;
const angle = b1.rotation;
const speed = b1.speed;

setProp(b1).speed = 12;
setProp(b1).bulletLifetime = 50;
setProp(b1).bulletTime = 10;
setProp(b1).x = 15;
setProp(b1).y = 25;
