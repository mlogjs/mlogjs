const conveyor = getBuilding("conveyor1");
const message = getBuilding("message3");
const display = getBuilding("display3");
const sorter = getBuilding("sorter1");
const illuminator = getBuilding("illuminator1");
const cyclone = getBuilding("cyclone1");

// specific ones
drawFlush(display);
printFlush(message);

// default ones
printFlush();
drawFlush();

const block = getLink(1);

control.color(illuminator, 10, 50, 9);

control.enabled(block, false);

control.config(sorter, Items.plastanium);

control.shoot({
  building: cyclone,
  x: 20,
  y: 40,
  shoot: true,
});

control.shootp({
  building: cyclone,
  unit: Vars.unit,
  shoot: true,
});

radar({
  building: cyclone,
  filters: ["enemy", "boss", "flying"],
  order: true,
  sort: "maxHealth",
});

sensor(LAccess.health, cyclone);
