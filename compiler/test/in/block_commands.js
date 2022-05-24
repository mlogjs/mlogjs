const conveyor = getBuilding("conveyor1");
const message = getBuilding("message1");
const display = getBuilding("display1");
const sorter = getBuilding("sorter1");
const illuminator = getBuilding("illuminator1");
const cyclone = getBuilding("cyclone1");

drawFlush(display);
printFlush(message);
const block = getLink(1);

control("color", illuminator, 10, 50, 9);
control("enabled", block, false);
control("config", sorter, Items.plastanium);
control("shoot", cyclone, 20, 40, true);
control("shootp", cyclone, Vars.unit, true);

radar(cyclone, "enemy", "boss", "flying", 1, "maxHealth");

sensor(LAccess.health, cyclone);
