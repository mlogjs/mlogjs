const array = new MutableArray([5, undefined, 3, undefined, 1]);

// the logs for this and for the foo function should be:
//```
// calculating 1
// calculating 2
// calculating 3
// calculating 4
//```
const { [calculate(1)]: a = calculate(2), [calculate(3)]: b = calculate(4) } =
  array;

print`a: ${a}, b: ${b}\n`;

// expected log
// Point(0, 0)
printPoint(Vars.unit);
// this depends on the test site
printPoint({ x: Vars.thisx, y: Vars.thisy });

printOtherPoint(array);

printFlush();

function printPoint({ x = 0, y = x }: { x?: number; y?: number }) {
  print`Point(${x}, ${y})\n`;
}

function printOtherPoint({
  [calculate(1)]: x = calculate(2),
  [calculate(3)]: y = calculate(4),
}: Record<number, number>) {
  print`OtherPoint(${x}, ${y})\n`;
}

function calculate(n: number) {
  print`calculating ${n}\n`;
  return n;
}
