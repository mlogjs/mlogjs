const turret = getBuilding("scatter1");
const radius = 5;
const { thisx: x, thisy: y } = Vars;

const unit = radar({
  building: turret,
  filters: ["player", "any", "any"],
  order: true,
  sort: "distance",
});

if (Math.len(unit.x - x, unit.y - y) > radius) {
  print("waiting...");
  printFlush();
}

while (Math.len(unit.x - x, unit.y - y) > radius);

print("the player is near the processor");
printFlush();
