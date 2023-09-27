// tests arrow functions

const add = (a, b) => a + b;

let type = 0;
let a = 1;
let b = 1;

let result = op(type, a, b);

print("The result is: ", result, ".");
printFlush();

function sub(a, b) {
  return a - b;
}

function mul(a, b) {
  return a * b;
}

function div(a, b) {
  return a / b;
}

function op(type, a, b) {
  if (type === 0) return add(a, b);
  if (type === 1) return sub(a, b);
  if (type === 2) return mul(a, b);
  if (type === 3) return div(a, b);
}
