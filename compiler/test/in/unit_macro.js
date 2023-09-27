if (Vars.unit == undefined) {
  unitBind(Units.flare);
}
print("ammo: ", Vars.unit.ammo, "\n");
print("health: ", Vars.unit.health, "\n");

let item = Items.copper;
print("amount of ", item, " : ", Vars.unit[item]);
printFlush();

const unitA = radar({
  building: getBuilding("cyclone1"),
  filters: ["enemy", "any", "any"],
  order: true,
  sort: "distance",
});
const unitB = unitRadar({
  filters: ["enemy", "flying", "any"],
  order: true,
  sort: "distance",
});
print(unitA.health, unitB.health);
