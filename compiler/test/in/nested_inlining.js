// refer to mlogjs/mlogjs#121

let a = 5;
print(b(5));

function b(x) {
  return x * c(x);
}

function c(x) {
  return x * 2;
}
