const a = "string literal";
const b = true;
const c = 12;
const d = false;

print(a, b, c);

const condition = Math.rand(c) > 10;

print(
  // b should be removed
  b && condition,
  // d should be removed
  d || condition,
  // evaluates to true
  b || condition,
  // evaluates to fales,
  d && condition
);
