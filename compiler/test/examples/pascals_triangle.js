// compute pascal's triangle

const triangleSize = 10;

const currentLine = new Memory(getBuilding("cell1"));
const previousLine = new Memory(getBuilding("cell2"));

print`1
1 1
`;

let lastSize = 2;

previousLine[0] = 1;
previousLine[1] = 1;

// starts at the 3d line (index 2)
for (let i = 3; i <= triangleSize; i++) {
  // compute the next line by combining
  // the elements of the previous line
  // idk how this method is called
  currentLine[0] = 1;
  for (let j = 1; j < lastSize; j++) {
    currentLine[j] = previousLine[j - 1] + previousLine[j];
  }
  currentLine[lastSize] = 1;
  lastSize++;

  // print the current line and overwrite the previous line
  for (let c = 0; c < lastSize; c++) {
    print(currentLine[c]);
    previousLine[c] = currentLine[c];
    if (c < lastSize - 1) print(" ");
  }
  print("\n");
}

printFlush();
