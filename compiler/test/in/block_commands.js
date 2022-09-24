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

control({
  mode: "color",
  building: illuminator,
  r: 10,
  g: 50,
  b: 9,
});
control({
  mode: "enabled",
  building: block,
  value: false,
});
control({
  mode: "config",
  building: sorter,
  value: Items.plastanium,
});
control({
  mode: "shoot",
  building: cyclone,
  x: 20,
  y: 40,
  shoot: true,
});
control({
  mode: "shootp",
  building: cyclone,
  unit: Vars.unit,
  shoot: true,
});

radar({
  building: cyclone,
  filters: ["enemy", "boss", "flying"],
  order: 1,
  sort: "maxHealth",
});

sensor(LAccess.health, cyclone);
