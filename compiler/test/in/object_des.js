let { x, y, health } = getBuilding("cyclone1");

const [, , , { type: coreType }] = unitLocate("building", "core", true);

print(x, y, health, coreType);
printFlush(getBuilding("message1"));

// test with objetc macro
({ x, y, health } = { x: 10, y: 20, health: 200 });

// test with nested object macro
({
  x,
  a: {
    y,
    b: [health],
  },
} = {
  x: 30,
  a: {
    y: 40,
    b: [500],
  },
});

print(x, y, health);
