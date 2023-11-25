// makes sure that the compiler evaluates constant bitwise
// operations using 64-bit integers to have parity with
// the mlog runtime

// integer outside the limits of 32-bit integers
const value = 2 ** 33;

print(value >> 30, "\n"); // expected: 8
print(value | 0, "\n"); // should not lose precision
print(value ^ (2 ** 32), "\n");
print(value << 1, "\n");
printFlush();
