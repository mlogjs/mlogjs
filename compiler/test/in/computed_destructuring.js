let { [calculate(1)]: a = calculate(2), [calculate(3)]: b = calculate(4) } =
  new MutableArray([5, 4, 3, 2, 1]);

print`a: ${a}, b: ${b}`;
printFlush();

function calculate(n) {
  print`calculating ${n}\n`;
  return n;
}
