const turret = getBuilding("cyclone1");
const coolant = Liquids.cryofluid;

print("current ammo: ", turret.ammo, "\n");

print("amount of ", coolant, " : ", turret[coolant], "\n");

printFlush(getBuilding("message1"));
