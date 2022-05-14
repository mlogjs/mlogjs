const { x, y, health } = getBuilding("cyclone1");

const [, , , { type: coreType }] = unitLocate("building", "core", true);

print(x, y, health, coreType);
printFlush(getBuilding("message1"));
