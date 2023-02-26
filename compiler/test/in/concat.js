const first = "first part and ";
const second = "second part and ";
const third = "third part";

print(concat(first, second, third));
print`${concat`${first}${second}${third}`}`;
printFlush(getBuilding("message1"));
