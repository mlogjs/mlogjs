const turret = getBuilding("foreshadow1");

let { x, y, shooting } = radar(turret, "player", "any", "any", 1, "distance");

if (!shooting) endScript();

setBlock("block", x, y, Blocks.boulder, Teams.sharded, 0);
