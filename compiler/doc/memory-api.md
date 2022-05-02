# Memory API

Allows you to interact with memory cells and manipulate their contents.

You can create a memory view like in the example bellow.

```js
const bank = getBuilding("bank1");
const memory = new Memory(bank, 512); // must be specified when using memory banks
```

Memory views can be indexed by numbers and also have a `length` property,
that allows you to easily iterate over their elements.

```js
// this will print the contents of all the items in the cell
for (let i = 0; i < memory.length; i++) {
  print(memory[i], "\n");
}
printFlush(getBuilding("message1"));
```

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
