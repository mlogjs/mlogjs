let { x, y, health } = getBuilding("cyclone1");

const [, , , { type: coreType }] = unitLocate("building", "core", true);

print(x, y, health, coreType);
printFlush(getBuilding("message1"));

// test with objetc macro
({ x, y, health } = { x: 10, y: 20, health: 200 });
print(x, y, health);
