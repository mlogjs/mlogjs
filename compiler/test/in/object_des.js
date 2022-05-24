const mem = new Memory(getBuilding("cell1"));

let { x, y, health } = getBuilding("cyclone1");

const [, , , { type: coreType }] = unitLocate("building", "core", true);

print(x, y, health, coreType);
printFlush(getBuilding("message1"));

// test with objetc macro
({ x, y, health, first: mem[0] } = { x: 10, y: 20, health: 200, first: 20 });

// test with nested object macro
({
  x,
  a: {
    y,
    b: [health, mem[0]],
  },
} = {
  x: 30,
  a: {
    y: 40,
    b: [500, 50],
  },
});

print(x, y, health, mem[0]);

// tests with function return values
const computed = enemy => unitLocate("building", "core", enemy)[3];

({ x, y } = computed(true));
