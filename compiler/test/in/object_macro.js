const obj = {
  0: "number index",
  a: 10,
  b: "String literal",
  c(number) {
    print("Number is ", number);
  },
  get d() {
    return Math.rand(10);
  },
};

print(obj.a);
print(obj.b);
print(obj[0]);
obj.c(20);
print(obj.d);

printFlush();
