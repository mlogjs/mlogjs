const mem = new Memory(getBuilding("cell1"));

const bigMem = new Memory(getBuilding("bank1"), 512);

print("Mem size", mem.length, "\n");
print("Big Mem size", bigMem.length, "\n");

print("mem at 0", mem[0]);
mem[0] = 120;
print("mem at 0 again", mem[0]);
