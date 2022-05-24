// The rest operator is not supported
const foo = {
  a: 10,
  b: 20,
  c: 30,
};

let a, stuff;

({ a, ...stuff } = foo);
