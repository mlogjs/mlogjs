const block = getBlock.block(10, 10);
const building = getBlock.building(10, 10);
const floor = getBlock.floor(10, 10);
const ore = getBlock.ore(10, 10);

print`there is a ${block} on top of a ${floor} and ${ore}\n`;

print`the building has ${building.health} health`;
