/// <reference path="../../lib/index.d.ts" />
// @ts-check

unitBind(Units.flare);
unitControl("approach", 0, 0, 5);
unitControl("boost", true);
unitControl("build", 0, 0, Blocks.router, 0);
unitControl("flag", 123);
unitControl("getBlock", 0, 0);
unitControl("idle");
unitControl("itemDrop", Blocks.air, 100);
unitControl("itemTake", getBuilding("shard1"), Items.copper, 10);

// specially handled cases
const isWithin = unitControl("within", 1, 2, 10);
print(isWithin);

const [type, building] = unitControl("getBlock", 10, 20);

print(type, building);
