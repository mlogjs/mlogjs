let counter = 10;

if (counter) {
  print`${counter} is a truthy value\n`;
}

// should print numbers from 10 to 1
do {
  print`${counter}\n`;
  counter--;
} while (counter);
printFlush();
