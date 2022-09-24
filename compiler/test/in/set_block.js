const turret = getBuilding("foreshadow1");

let { x, y, shooting } = radar({
  building: turret,
  filters: ["player", "any", "any"],
  order: 1,
  sort: "distance",
});

if (!shooting) endScript();

setBlock.block({ x, y, to: Blocks.boulder, team: Teams.sharded, rotation: 0 });
