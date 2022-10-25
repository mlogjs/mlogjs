# Memory API

Allows you to interact with memory cells and manipulate their contents.

You can create a memory view like in the example bellow.

```js
const bank = getBuilding("bank1");
// the memory size must be specified when using memory banks
const memory = new Memory(bank, 512);
```

Memory views can be indexed by numbers and also have a `length` property,
that allows you to easily iterate over their elements.

```js
let sum = 0;
// prints the sum of all the entries of the memory cell
for (let i = 0; i < memory.length; i++) {
  sum += memory[i];
}
print(sum);
printFlush();
```

Bellow is a demonstration using the memory api to "initialize" a processor

```js
const bank = getBuilding("bank1");

// tell the compiler the size of the memory unit. 64 by default
const mem = new Memory(bank, 512);

if (mem[0] == 0) {
  mem[0] = 1;
  print("Processor initialized");
} else {
  let runs = mem[1];
  print`This code has run ${runs} time(s)`;
  mem[1]++;
}

printFlush();
```
