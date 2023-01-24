const a = Math.rand(10) > 5;
const b = Math.rand(10) > 5;
const c = a && b;
const d = a || b;
print`
a: ${a}
b: ${b}
a && b: ${c}
a || b: ${d}
`;
