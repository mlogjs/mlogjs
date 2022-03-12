# Memory API

Allows you to interact with memory cells and manipulate their contents.

Bellow is a demonstration using the memory api to "intialize" a processor

```js
const bank = getBuilding("bank1");
const message = getBuilding("message1");

const mem = new Memory(bank, 512); // tell the compiler the size of the memory unit. 64 by default

if (mem[0] == 0) {
  mem[0] = 1;
  print("Processor intialized");
} else {
  let runs = mem[1];
  print("This code has run ", runs, " time(s)");
  mem[1]++;
}

printFlush(message);
```
