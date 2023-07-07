const { bank1: bank, message1: message } = getBuildings();

const mem = new Memory(bank, 512); // tell the compiler the size of the memory unit. 64 by default
print("Expecting ", mem.length, " bytes to be available");

if (mem[0] == 0) {
  mem[0] = 1;
  print("Processor intialized");
} else {
  let runs = mem[1];
  print("This code has run ", runs, " time(s)");
  mem[1]++;
}

printFlush(message);
