const turret = getBuilding("foreshadow1");

const unit = radar({
  building: turret,
  filters: ["enemy", "any", "any"],
  order: 1,
  sort: "distance",
});

applyStatus.apply("melting", unit, 20);
applyStatus.apply("tarred", unit, 20);
