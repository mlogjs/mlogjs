function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

print(factorial(5));
printFlush(getBuilding("message1"));

/*

bank1: 0, x, 5
sp = 3
sf = 2
ret = 9
t0 = 5

*/