let a = 1;
const result = Math.rand(1) > 0.5 ? (a++, a * 2) : a - 1;
print(result);
