const pos = Math.rand(10);

const content =
  pos < 2 ? "low" : pos < 4 ? "medium" : pos < 6 ? "high" : "very high";

print(content);

const offset = pos - 5; // -5 to 5

print(-offset);
print(+offset);
// should be evaluated at compile time to 10
print(1 + 2 > 1.4 ? 10 : -5);
print(1 + 1 != 2 ? "it's false" : "huh, true");

print(
  null ?? "null is null",
  offset ?? "offset is null?",
  "preserved" ?? "should not appear"
);

let item = Math.rand(1) > 0.5 ? null : Items.beryllium;

item ??= Items.copper;
