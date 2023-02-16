const x = Math.rand(10);
const y = Math.rand(2) > 1 ? 1 : 2;
switch (y) {
  case 1:
    print`${x + y} > ${x - y}`;
    break;
  case 2:
    print`${x - y} < ${x + y}`;
    break;
}

printFlush();
