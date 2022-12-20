const arr = new DynamicArray<number>(5);
arr.fill(0);

print`last: ${arr.removeAt(arr.size - 1)}\n`;

const index = -Math.floor(Math.rand(arr.length));
print`${index}: ${arr.at(index)}\n`;
printFlush();

wait(2);

const counterLimit = 4;
let counter = 0;

// eslint-disable-next-line no-constant-condition
while (true) {
  if (arr.length == 0) {
    for (let i = 1; i <= arr.size; i++) {
      // random squares from 1 to 20
      unchecked(arr.push(Math.floor(Math.rand(20) + 1) ** 2));
    }
  } else {
    switch (counter) {
      case 0: {
        // test remove at with output
        const number = arr.removeAt(Math.floor(Math.rand(arr.length)));
        print`removed: ${number}\n`;
        break;
      }
      case 1: {
        // test remove at without output
        const index = Math.floor(Math.rand(arr.length));
        const number = arr[index];
        arr.removeAt(index);
        print`removed: ${number}\n`;
        break;
      }
      case 2:
        print`removed: ${arr.pop()}\n`;
        break;
      case 3: {
        print`removed: ${arr.at(-1)}\n`;
        arr.pop();
        break;
      }
    }
    counter = (counter + 1) % counterLimit;
  }

  for (let i = 0; i < arr.length; i++) {
    print(arr[i], "\n");
  }

  printFlush();
  wait(1.5);
}
