import { fetch } from "mlogjs:world";

const routers = fetch.buildCount(Teams.sharded, Blocks.router);

for (let i = 0; i < routers; i++) {
  const router = fetch.build(Teams.sharded, i, Blocks.router);
  print`x: ${router.x} y: ${router.y}\n`;
}

printFlush();
