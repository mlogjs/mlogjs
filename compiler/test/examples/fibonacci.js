print(fibonacci(10));
printFlush();

function fibonacci(n) {
  if (n <= 2) return 1;

  let a = 1;
  let b = 1;
  let c = 2;

  for (let i = 3; i <= n; i++) {
    c = a + b;
    a = b;
    b = c;
  }

  return c;
}
