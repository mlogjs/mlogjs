const turret = getBuilding("foreshadow1");

const player = radar(turret, "player", "any", "any", 1, "distance");

print`You is a ${player}`;
flushMessage("announce", 3);
wait(10);
