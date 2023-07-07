const { message3, display3, sorter1, illuminator1, cyclone1 } = getBuildings();

// specific ones
drawFlush(display3);
printFlush(message3);

// default ones
printFlush();
drawFlush();

const block = getLink(1);

control.color(illuminator1, packColor(0.04, 0.2, 0.04, 1));

control.enabled(block, false);

control.config(sorter1, Items.plastanium);

control.shoot({
  building: cyclone1,
  x: 20,
  y: 40,
  shoot: true,
});

control.shootp({
  building: cyclone1,
  unit: Vars.unit,
  shoot: true,
});

radar({
  building: cyclone1,
  filters: ["enemy", "boss", "flying"],
  order: true,
  sort: "maxHealth",
});

sensor(LAccess.health, cyclone1);
