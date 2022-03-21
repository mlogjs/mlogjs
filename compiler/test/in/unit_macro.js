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

const unitA = radar(
  getBuilding("cyclone1"),
  "enemy",
  "any",
  "any",
  1,
  "distance"
);
const unitB = unitRadar("enemy", "flying", "any", 1, "distance");
print(unitA.health, unitB.health);
