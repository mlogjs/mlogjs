const first = "first part and ";
const second = "second part and ";
const third = "third part";

print(concat(first, second, third), "\n");
print(concat`${first}${second}${third}`, "\n");

// ensures that it works with other literals
print(concat(0, " ", undefined, " ", false), "\n");
print(concat`${0} ${undefined} ${false}`, "\n");

printFlush();
