const turret = getBuilding("foreshadow1");

const player = radar({
  building: turret,
  filters: ["player", "any", "any"],
  order: true,
  sort: "distance",
});

print`You is a ${player}`;
flushMessage.announce(3);
wait(10);
