// Doing this is needed because typescript
// will otherwise infer the type of Vars.unit to be never
const unit = Vars.unit;
if (unit == null) {
  unitBind(Units.flare);
}
print("ammo: ", Vars.unit.ammo, "\n");
print("health: ", Vars.unit.health, "\n");

let item = Items.copper;
print("amount of ", item, " : ", Vars.unit[item]);
printFlush(getBuilding("message1"));

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
