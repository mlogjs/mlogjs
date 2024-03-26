const factor = 1000;
const last = Math.floor(Vars.time / factor);
while (Math.floor(Vars.time / factor) == last);

print("This should be reachable");
printFlush();
