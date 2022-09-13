const turret = getBuilding("foreshadow1");

let { x, y, shooting } = radar(turret, "player", "any", "any", 1, "distance");

// TODO: !shooting doesn't work
if (shooting == false) endScript();

setBlock("block", x, y, Blocks.boulder, Teams.sharded, 0);
