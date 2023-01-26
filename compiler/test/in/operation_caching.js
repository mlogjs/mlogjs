let a = 1;

a + 1;

a + 2;

print`
a + 2: ${a + 2}
a + 1: ${a + 1}
2 + a: ${2 + a}
1 + a: ${1 + a}
log2 a: ${Math.log(a) / Math.log(2)}
`;

if (Math.rand(2) >= 1) {
  print(Math.rand(2) >= 1);
  print(Math.log(a) / Math.log(2), "\n");
  a++;
  print(Math.log(a) / Math.log(2), "\n");
}

// checks if the cache was cleared
print`a + 1: ${a + 1}`;

// checks if the ** operator and Math.pow
// have the same cache
print`
Math.pow(a, 2): ${Math.pow(a, 2)}
a ** 2: ${a ** 2}
`;

printFlush();
