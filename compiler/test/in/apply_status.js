const turret = getBuilding("foreshadow1");

const unit = radar({
  building: turret,
  filters: ["ground", "any", "any"],
  order: true,
  sort: "distance",
});

applyStatus.apply("overdrive", unit);
applyStatus.apply("melting", unit, 20);
applyStatus.apply("burning", unit, 20);
applyStatus.apply("tarred", unit, 20);

wait(2);

applyStatus.clear("overdrive", unit);

wait(3);
