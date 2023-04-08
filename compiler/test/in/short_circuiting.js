// tests code generation for nested logical operators

// these two should be the same
let result;
block: {
  result = Vars.unit.firstItem;
  if (result !== undefined) break block;
  result = Vars.unit.type;
  if (result !== undefined) break block;
  result = Math.radToDeg;
}

result = Vars.unit.firstItem ?? Vars.unit.type ?? Math.radToDeg;

print(Math.rand(1) ?? Math.rand(2) ?? Math.rand(3));
print(Math.rand(1) || Math.rand(2) || Math.rand(3));
print(Math.rand(1) && Math.rand(2) && Math.rand(3));

print(Math.rand(1) || (Math.rand(2) && Math.rand(3)));
print((Math.rand(1) && Math.rand(2)) || Math.rand(3));

print((Math.rand(1) || Math.rand(2)) && (Math.rand(3) || Math.rand(4)));
print((Math.rand(1) ?? Math.rand(2)) || Math.rand(3));

print(
  Math.rand(1) && (Math.rand(2) ?? Math.rand(3) ?? Math.rand(4)) && Math.rand(5)
);

print((Math.rand(1) && Math.rand(2)) ?? (Math.rand(3) || Math.rand(4)));
print((Math.rand(1) || Math.rand(2)) ?? (Math.rand(3) && Math.rand(4)));

print((Math.rand(1) ?? Math.rand(2)) || Math.rand(3) || Math.rand(4));

let b = Math.rand(1) || Math.rand(2);

b &&= Math.rand(3);
b = b || Math.rand(3) || Math.rand(4);
b ||= Math.rand(3) || Math.rand(4);
