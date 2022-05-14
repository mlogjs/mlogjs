// tests destructuring with array macros
const array = [5, 19, 123, "foo"];

const [a, b, c, d] = array;

print(a);
print(b);
print(c);
print(d);

// test non constant assignment
let [e, f, g, h] = array;

// reassignment

[h, g, f, e] = array;
print(e);
print(f);
print(g);
print(h);
